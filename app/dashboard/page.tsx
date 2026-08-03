"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CirclePlus,
  Clock3,
  Cpu,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Send,
  TerminalSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient, isConfigured } from "@/utils/supabase/client";
import { BrainGlyph } from "../components/Logo";
import {
  normalizeBrainStatus,
  normalizeControlResult,
  normalizePresence,
  type BrainActivity,
  type BrainStatus,
  type BrainTerminal,
  type Presence,
} from "./normalize";
import {
  createControlMessage,
  isMatchingControlResult,
  shouldOpenRealtime,
  type ControlAction,
} from "./protocol";
import { backoffDelay } from "./backoff";
import { DEMO_EMAIL, DEMO_FLAG, DEMO_ROOM } from "../login/demoAuth";
import { demoBrain, demoPresence } from "./demoData";

type ConnectionState = "connecting" | "on" | "off";
type PendingAction = { requestId: string; action: ControlAction };
type Notice = { ok: boolean; message: string };

const PRESENCE_STALE_MS = 20_000;

function requestID(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function fmtTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

function ageLabel(startedAt: number, now: number): string {
  if (!startedAt || startedAt > now) return "now";
  const seconds = Math.floor((now - startedAt) / 1_000);
  if (seconds < 10) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [brain, setBrain] = useState<BrainStatus | null>(null);
  const [presence, setPresence] = useState<Presence | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [taskDraft, setTaskDraft] = useState("");
  const [steerDraft, setSteerDraft] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [reconnectNonce, setReconnectNonce] = useState(0);
  const [, forceTick] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pingAtRef = useRef(0);
  const reconnectAttemptRef = useRef(0);
  const pendingRef = useRef<PendingAction | null>(null);

  useEffect(() => {
    const demo = (() => {
      try { return sessionStorage.getItem(DEMO_FLAG) === "1"; }
      catch { return false; }
    })();
    if (demo) {
      setIsDemo(true);
      setEmail(DEMO_EMAIL);
      setRoom(DEMO_ROOM);
      setPresence(demoPresence);
      setBrain(demoBrain);
      return;
    }

    if (!isConfigured) { router.replace("/login"); return; }
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) { router.replace("/login"); return; }
      setEmail(data.user.email ?? null);
      setRoom(`termi:${data.user.id}`);
    }).catch(() => { if (active) router.replace("/login"); });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && !session) router.replace("/login");
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => forceTick((value) => value + 1), 5_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      if (pendingRef.current?.requestId !== pending.requestId) return;
      pendingRef.current = null;
      setPending(null);
      setNotice({ ok: false, message: "Termi did not acknowledge the request. Check that the Mac app is online and updated." });
    }, 15_000);
    return () => clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    if (!room) return;
    if (!shouldOpenRealtime(isDemo, isConfigured)) {
      setStatus(isDemo ? "on" : "off");
      return;
    }
    setStatus("connecting");
    const supabase = createClient();
    const channel = supabase.channel(room, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    channel.on("broadcast", { event: "msg" }, ({ payload }) => {
      try {
        const value = payload && typeof payload === "object" ? payload : {};
        const type = "type" in value && typeof value.type === "string" ? value.type : "";
        if (type === "pong") {
          if (pingAtRef.current) setLatency(Date.now() - pingAtRef.current);
          pingAtRef.current = 0;
          return;
        }
        if (type === "brain_status") {
          const next = normalizeBrainStatus(value);
          if (next) setBrain(next);
          return;
        }
        if (type === "presence") {
          const next = normalizePresence(value, Date.now());
          if (next) setPresence(next);
          return;
        }
        if (type === "control_result") {
          const result = normalizeControlResult(value);
          if (!result || result.action === "status_request") return;
          if (!isMatchingControlResult(pendingRef.current?.requestId ?? null, result.requestId)) return;
          pendingRef.current = null;
          setPending(null);
          setNotice({ ok: result.ok, message: result.message });
          if (result.ok && result.action === "task_start") setTaskDraft("");
          if (result.ok && result.action === "brain_instruct") setSteerDraft("");
        }
      } catch {
        // Realtime payloads are untrusted. Ignore malformed events without breaking the room.
      }
    });

    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleReconnect = () => {
      if (reconnectTimer) return;
      reconnectTimer = setTimeout(
        () => setReconnectNonce((value) => value + 1),
        backoffDelay(reconnectAttemptRef.current++),
      );
    };

    channel.subscribe((next) => {
      if (next === "SUBSCRIBED") {
        setStatus("on");
        reconnectAttemptRef.current = 0;
        channel.send({
          type: "broadcast",
          event: "msg",
          payload: { type: "status_request", requestId: requestID("status"), t: Date.now() },
        });
      } else if (next === "CHANNEL_ERROR" || next === "TIMED_OUT" || next === "CLOSED") {
        setStatus("off");
        scheduleReconnect();
      }
    });

    const heartbeat = setInterval(() => {
      if (pingAtRef.current) setLatency(null);
      pingAtRef.current = Date.now();
      channel.send({ type: "broadcast", event: "msg", payload: { type: "ping", t: pingAtRef.current } });
    }, 10_000);

    return () => {
      clearInterval(heartbeat);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      channelRef.current = null;
      pingAtRef.current = 0;
      supabase.removeChannel(channel);
    };
  }, [room, reconnectNonce, isDemo]);

  useEffect(() => {
    const reconnect = () => {
      if (!navigator.onLine) return;
      reconnectAttemptRef.current = 0;
      setReconnectNonce((value) => value + 1);
    };
    const onVisible = () => { if (!document.hidden) reconnect(); };
    window.addEventListener("online", reconnect);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", reconnect);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const livePresence = isDemo
    ? presence
    : presence && Date.now() - presence.at < PRESENCE_STALE_MS ? presence : null;
  const termiOnline = Boolean(livePresence);
  const taskPhase = livePresence?.taskPhase ?? (brain?.isRunning ? "running" : "idle");
  const brainRunning = taskPhase === "running" && Boolean(brain?.isRunning) && termiOnline;
  const preparing = taskPhase === "preparing" && termiOnline;
  const activeTerminals = brainRunning ? brain?.terminals ?? [] : [];
  const controlEnabled = status === "on" && termiOnline && !isDemo;

  const sendControl = (action: ControlAction, instruction: string) => {
    if (!controlEnabled || !channelRef.current) {
      setNotice({ ok: false, message: "Termi must be online with web task control enabled." });
      return;
    }
    const id = requestID(action);
    const message = createControlMessage(action, instruction, id);
    if (!message) return;
    setNotice(null);
    const nextPending = { requestId: id, action };
    pendingRef.current = nextPending;
    setPending(nextPending);
    channelRef.current.send({ type: "broadcast", event: "msg", payload: message });
  };

  const refresh = () => {
    channelRef.current?.send({
      type: "broadcast",
      event: "msg",
      payload: { type: "status_request", requestId: requestID("status"), t: Date.now() },
    });
  };

  const signOut = async () => {
    if (isDemo) {
      try { sessionStorage.removeItem(DEMO_FLAG); } catch { /* no-op */ }
      router.replace("/login");
      return;
    }
    try { await createClient().auth.signOut(); } catch { /* always leave the dashboard */ }
    router.replace("/login");
  };

  if (!room) {
    return <div className="min-h-screen grid place-items-center text-neutral-500">Loading control room…</div>;
  }

  const completedCount = activeTerminals.filter((terminal) => terminal.complete).length;
  const blockedCount = activeTerminals.filter((terminal) => terminal.blocker).length;
  const connectionLabel = !termiOnline
    ? "Mac offline"
    : preparing
      ? "Preparing task"
      : brainRunning
        ? "Task running"
        : "Ready";

  return (
    <div className="min-h-screen bg-[--color-ink] text-[--color-fg]">
      <header className="sticky top-0 z-30 border-b border-[--color-line] bg-[--color-ink]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-15 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold" aria-label="Termi home">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[--color-line-2] bg-[--color-panel-2]">
              <BrainGlyph size={17} />
            </span>
            <span>Termi<span className="text-[--color-coral]">.</span></span>
          </Link>

          <div className="hidden h-5 w-px bg-[--color-line] sm:block" />
          <span className="hidden text-sm text-neutral-500 sm:block">Control room</span>
          <div className="ml-auto flex items-center gap-2">
            <ConnectionPill status={status} online={termiOnline} label={connectionLabel} />
            <button
              type="button"
              onClick={refresh}
              disabled={status !== "on"}
              title="Refresh Mac status"
              aria-label="Refresh Mac status"
              className="grid h-8 w-8 place-items-center rounded-md border border-[--color-line] text-neutral-400 transition hover:border-neutral-500 hover:text-white disabled:opacity-40"
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex h-8 items-center gap-2 rounded-md border border-[--color-line] px-2.5 text-xs text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{isDemo ? "Exit demo" : "Sign out"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 border-b border-[--color-line] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">Remote workspace</p>
            <h1 className="mt-1 text-2xl font-semibold">Task control</h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><Cpu size={13} /> {livePresence?.provider ?? "No provider"}</span>
            <span className="flex items-center gap-1.5"><TerminalSquare size={13} /> {livePresence?.terminalCount ?? 0} terminals</span>
            <span className="flex items-center gap-1.5"><Clock3 size={13} /> {latency == null ? "No latency" : `${latency} ms`}</span>
            {!isDemo && <span className="max-w-56 truncate" title={email ?? ""}>{email}</span>}
          </div>
        </div>

        {isDemo && (
          <StatusBanner tone="info" message="Demo mode is view-only. Sign in with your own account to start or steer tasks." />
        )}
        {!isDemo && status === "on" && !termiOnline && (
          <StatusBanner tone="warning" message="The room is connected, but the Termi app is not reporting. Open Termi on your Mac and connect the same account." />
        )}
        {notice && <StatusBanner tone={notice.ok ? "success" : "warning"} message={notice.message} />}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
          <section className="min-w-0 border border-[--color-line] bg-[--color-panel]">
            <SectionHeader
              icon={<BrainCircuit size={17} />}
              title="Brain activity"
              meta={brainRunning ? `${brain?.runningCalls ?? 0} calls in flight` : preparing ? "Planning and provisioning" : "Waiting for a task"}
            />
            <div className="border-b border-[--color-line] px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${brainRunning || preparing ? "bg-emerald-400 pip" : "bg-neutral-600"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-100">
                    {preparing ? "Preparing the task" : brainRunning ? brain?.status || "Supervising terminals" : termiOnline ? "Brain is idle" : "Waiting for the Mac"}
                  </p>
                  {(brainRunning && (brain?.summary || brain?.status)) && (
                    <p className="mt-1 text-sm leading-6 text-neutral-400">{brain.summary || brain.status}</p>
                  )}
                </div>
              </div>
            </div>
            <ActivityFeed activity={brain?.activity ?? []} now={Date.now()} online={termiOnline} />
            <div className="grid grid-cols-2 border-t border-[--color-line] sm:grid-cols-4">
              <Metric label="Pass" value={brainRunning ? brain?.pass ?? 0 : "—"} />
              <Metric label="Calls" value={brain?.invokes ?? "—"} />
              <Metric label="Tokens" value={brain?.tokens == null ? "—" : fmtTokens(brain.tokens)} />
              <Metric label="Approx. cost" value={brain?.costUSD && brain.costUSD > 0 ? `$${brain.costUSD.toFixed(2)}` : "—"} />
            </div>
          </section>

          <section className="border border-[--color-line] bg-[--color-panel]">
            <SectionHeader
              icon={<CirclePlus size={17} />}
              title="New task"
              meta={brainRunning ? "Available when this task finishes" : preparing ? "Termi is preparing your request" : "Starts on your Mac"}
            />
            <div className="p-4 sm:p-5">
              <label htmlFor="task-draft" className="text-xs font-medium text-neutral-400">Outcome</label>
              <textarea
                id="task-draft"
                value={taskDraft}
                onChange={(event) => setTaskDraft(event.target.value)}
                disabled={brainRunning || preparing || isDemo}
                maxLength={4_000}
                rows={7}
                placeholder="Describe the completed task you want back…"
                className="mt-2 w-full resize-none border border-[--color-line] bg-[--color-ink] px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-[--color-coral] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-600">{taskDraft.length.toLocaleString()} / 4,000</span>
                <button
                  type="button"
                  onClick={() => sendControl("task_start", taskDraft)}
                  disabled={!controlEnabled || brainRunning || preparing || !taskDraft.trim() || pending !== null}
                  className="flex h-9 items-center gap-2 rounded-md bg-[--color-coral] px-4 text-sm font-semibold text-white transition hover:bg-[--color-coral-600] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending?.action === "task_start" ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}
                  Start task
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-3 border-b border-[--color-line] pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TerminalSquare size={17} className="text-sky-400" />
                Terminal summaries
              </div>
              <p className="mt-1 text-xs text-neutral-500">One digest for each terminal attached to the running task.</p>
            </div>
            {brainRunning && (
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span className="text-emerald-400">{completedCount} done</span>
                <span className={blockedCount > 0 ? "text-red-400" : ""}>{blockedCount} blocked</span>
                <span>{activeTerminals.length} total</span>
              </div>
            )}
          </div>

          {!brainRunning ? (
            <div className="grid min-h-40 place-items-center border-b border-[--color-line] text-center">
              <div className="max-w-md px-4 py-8">
                <TerminalSquare className="mx-auto text-neutral-700" size={24} />
                <p className="mt-3 text-sm font-medium text-neutral-300">
                  {preparing ? "Terminal summaries will appear when planning completes." : "No task is running."}
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  Start a task from this page and each terminal&apos;s assignment, progress, blockers, and checks will stream here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
              {activeTerminals.map((terminal, index) => (
                <TerminalSummary key={terminal.id ?? `${terminal.title}-${index}`} terminal={terminal} index={index} />
              ))}
            </div>
          )}

          {brainRunning && (
            <div className="mt-4 flex flex-col gap-2 border-t border-[--color-line] pt-4 sm:flex-row">
              <input
                value={steerDraft}
                onChange={(event) => setSteerDraft(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendControl("brain_instruct", steerDraft)}
                maxLength={4_000}
                placeholder="Give the running task a new instruction…"
                aria-label="New instruction for the running task"
                className="h-10 flex-1 border border-[--color-line] bg-[--color-panel] px-3 text-sm outline-none transition placeholder:text-neutral-600 focus:border-[--color-coral]"
              />
              <button
                type="button"
                onClick={() => sendControl("brain_instruct", steerDraft)}
                disabled={!controlEnabled || !steerDraft.trim() || pending !== null}
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-[--color-line-2] px-4 text-sm font-medium transition hover:border-[--color-coral] hover:text-[--color-coral] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending?.action === "brain_instruct" ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}
                Update task
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ConnectionPill({ status, online, label }: { status: ConnectionState; online: boolean; label: string }) {
  const healthy = status === "on" && online;
  return (
    <span className={`flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs ${
      healthy
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-[--color-line] bg-[--color-panel] text-neutral-400"
    }`}>
      {healthy ? <Wifi size={13} /> : status === "connecting" ? <LoaderCircle className="animate-spin" size={13} /> : <WifiOff size={13} />}
      <span>{status === "connecting" ? "Connecting" : label}</span>
    </span>
  );
}

function SectionHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <div className="flex min-h-13 items-center gap-2 border-b border-[--color-line] px-4 sm:px-5">
      <span className="text-[--color-coral]">{icon}</span>
      <h2 className="text-sm font-semibold">{title}</h2>
      <span className="ml-auto text-right text-xs text-neutral-600">{meta}</span>
    </div>
  );
}

function ActivityFeed({ activity, now, online }: { activity: BrainActivity[]; now: number; online: boolean }) {
  if (!online || activity.length === 0) {
    return (
      <div className="grid min-h-48 place-items-center px-5 text-center text-sm text-neutral-600">
        {online ? "Brain actions will appear here as Termi plans, reviews, and verifies work." : "Waiting for live activity from the Mac app."}
      </div>
    );
  }
  return (
    <div className="max-h-72 min-h-48 overflow-auto">
      {activity.map((item, index) => (
        <div key={`${item.startedAt}-${item.feature}-${index}`} className="grid grid-cols-[18px_minmax(0,1fr)_auto] gap-2 border-b border-[--color-line]/70 px-4 py-3 last:border-b-0 sm:px-5">
          <span className={`mt-1 h-2 w-2 rounded-full ${item.state === "running" ? "bg-amber-400 pip" : item.state === "failed" ? "bg-red-400" : "bg-emerald-400"}`} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-300">{item.feature}</p>
            <p className="mt-0.5 truncate text-sm text-neutral-500" title={item.headline}>{item.headline}</p>
          </div>
          <span className="text-xs tabular-nums text-neutral-700">{ageLabel(item.startedAt, now)}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-r border-[--color-line] px-4 py-3 last:border-r-0 even:border-r-0 sm:even:border-r sm:last:border-r-0">
      <div className="text-sm font-semibold tabular-nums text-neutral-200">{value}</div>
      <div className="mt-0.5 text-[11px] text-neutral-600">{label}</div>
    </div>
  );
}

function TerminalSummary({ terminal, index }: { terminal: BrainTerminal; index: number }) {
  const status = terminal.blocker ? "Blocked" : terminal.complete ? "Done" : terminal.supervising ? "Reviewing" : "Working";
  const statusClass = terminal.blocker ? "text-red-400" : terminal.complete ? "text-emerald-400" : terminal.supervising ? "text-amber-300" : "text-sky-300";
  return (
    <article className="flex min-h-64 flex-col border border-[--color-line] bg-[--color-panel]">
      <div className="flex items-center gap-2 border-b border-[--color-line] px-4 py-3">
        <span className="font-mono text-xs text-neutral-600">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold" title={terminal.title}>{terminal.title}</h3>
        <span className={`text-xs font-medium ${statusClass}`}>{status}</span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <p className="text-[11px] font-medium uppercase text-neutral-600">Now</p>
          <p className="mt-1 text-sm leading-6 text-neutral-300">{terminal.progress || "Waiting for the next supervisor pass."}</p>
        </div>
        {terminal.instruction && (
          <div>
            <p className="text-[11px] font-medium uppercase text-neutral-600">Assignment</p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-neutral-500" title={terminal.instruction}>{terminal.instruction}</p>
          </div>
        )}
        {terminal.blocker && (
          <div className="flex gap-2 border-l-2 border-red-400 bg-red-500/[0.06] px-3 py-2 text-xs leading-5 text-red-300">
            <AlertTriangle className="mt-0.5 shrink-0" size={13} />
            <span>{terminal.blocker}</span>
          </div>
        )}
        {terminal.tests && terminal.tests.length > 0 && (
          <div className="mt-auto border-t border-[--color-line] pt-3">
            <p className="mb-2 text-[11px] font-medium uppercase text-neutral-600">Checks</p>
            <div className="space-y-1.5">
              {terminal.tests.slice(0, 5).map((test, testIndex) => (
                <div key={`${test.name}-${testIndex}`} className="flex items-start gap-2 text-xs text-neutral-400">
                  {test.passed ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={13} /> : <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={13} />}
                  <span>{test.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 text-[11px] text-neutral-600">
          {terminal.model && <span className="truncate">{terminal.model}</span>}
          {terminal.tokens != null && terminal.tokens > 0 && <span className="ml-auto tabular-nums">{fmtTokens(terminal.tokens)} tokens</span>}
        </div>
      </div>
    </article>
  );
}

function StatusBanner({ tone, message }: { tone: "info" | "warning" | "success"; message: string }) {
  const style = tone === "success"
    ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-200"
    : tone === "warning"
      ? "border-amber-500/25 bg-amber-500/[0.06] text-amber-200"
      : "border-sky-500/25 bg-sky-500/[0.06] text-sky-200";
  return <div className={`mt-4 border px-4 py-3 text-sm ${style}`}>{message}</div>;
}
