"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, isConfigured } from "@/utils/supabase/client";
import { BrainGlyph } from "../components/Logo";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { normalizeBrainStatus, normalizePresence, type BrainStatus, type Presence } from "./normalize";
import { record, up, down, type HistState } from "./history";
import { backoffDelay } from "./backoff";
import { DEMO_FLAG, DEMO_ROOM, DEMO_EMAIL } from "../login/demoAuth";
import { demoPresence, demoBrain, demoFeed } from "./demoData";

type Line = { id: number; text: string; kind: "in" | "out" | "sys"; at: number };

// HH:MM:SS in the viewer's locale, guarded (Intl can throw on odd inputs).
function clockStamp(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString([], { hour12: false });
  } catch {
    return "";
  }
}

// JSON.stringify can throw (circular refs, BigInt); never let that break the feed.
function safeStringify(v: unknown): string {
  try {
    const s = JSON.stringify(v);
    return s.length > 500 ? s.slice(0, 500) + "…" : s;
  } catch {
    return "[unserializable message]";
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "on" | "off">("connecting");
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [instruct, setInstruct] = useState("");
  // Brain status pushed from Termi each AFK pass (normalized from untrusted payloads).
  const [brain, setBrain] = useState<BrainStatus | null>(null);
  // Lightweight presence heartbeat from Termi (shown even when AFK is off).
  const [presence, setPresence] = useState<Presence | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const pingAtRef = useRef(0);
  // Command history for ↑/↓ recall — pure logic lives in ./history.
  const histRef = useRef<HistState>({ history: [], idx: 0, draft: "", value: "" });
  // Auto-reconnect: bumping this re-runs the channel effect; attempt drives backoff.
  const [reconnectNonce, setReconnectNonce] = useState(0);
  const attemptRef = useRef(0);
  // Demo session (demo / demo): no Supabase, seeded data, shared demo room.
  const [isDemo, setIsDemo] = useState(false);
  // Monitor tab: raw console traffic vs the brain status stream.
  const [tab, setTab] = useState<"console" | "brain">("console");

  const log = (text: string, kind: Line["kind"]) =>
    setLines((p) => [...p.slice(-499), { id: idRef.current++, text, kind, at: Date.now() }]);

  const clearLog = () => setLines([]);

  useEffect(() => {
    // Demo session: no Supabase user, fixed demo room. Seed the panels so the
    // dashboard looks alive even with no Mac connected; a real Termi on
    // termi:demo will overwrite these with live broadcasts.
    const demo = (() => { try { return sessionStorage.getItem(DEMO_FLAG) === "1"; } catch { return false; } })();
    if (demo) {
      setIsDemo(true);
      setEmail(DEMO_EMAIL);
      setRoom(DEMO_ROOM);
      setPresence(demoPresence);
      setBrain(demoBrain);
      setLines(demoFeed.map((l, i) => ({ id: i, text: l.text, kind: l.kind, at: Date.now() })));
      idRef.current = demoFeed.length;
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

    // React to sign-out / token loss (e.g. another tab, expiry) by bouncing to login.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session) router.replace("/login");
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router]);

  // Tick every 5s so presence/brain can be treated as stale if Termi goes quiet.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!room) return;
    setStatus("connecting");
    const supabase = createClient();
    const channel = supabase.channel(room, { config: { broadcast: { self: false } } });
    channelRef.current = channel;
    channel.on("broadcast", { event: "msg" }, ({ payload }) => {
      try {
        const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
        const type = typeof p.type === "string" ? p.type : "message";
        if (type === "pong") { if (pingAtRef.current) setLatency(Date.now() - pingAtRef.current); pingAtRef.current = 0; return; }
        // Brain status update — render in the brain panel, don't clutter the console feed.
        if (type === "brain_status") { const b = normalizeBrainStatus(p); if (b) setBrain(b); return; }
        if (type === "presence") { const pr = normalizePresence(p, Date.now()); if (pr) setPresence(pr); return; }
        // Ignore our own echoed commands/instructions (self:false doesn't cover every relay path).
        if (type === "command" || type === "ping") return;
        const msg = typeof p.message === "string" ? p.message : safeStringify(p);
        log(`${type}: ${msg}`, "in");
      } catch {
        // A malformed message must never break the live feed.
      }
    });
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleReconnect = () => {
      if (reconnectTimer) return; // one pending reconnect at a time
      const delay = backoffDelay(attemptRef.current++);
      reconnectTimer = setTimeout(() => setReconnectNonce((n) => n + 1), delay);
    };

    channel.subscribe((s) => {
      if (s === "SUBSCRIBED") {
        setStatus("on");
        if (attemptRef.current > 0) { log("reconnected to your terminal room", "sys"); attemptRef.current = 0; }
        else log("connected to your terminal room", "sys");
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
        setStatus("off");
        scheduleReconnect();
      }
    });
    const t = setInterval(() => {
      // If the previous ping never got a pong, the peer is unresponsive — clear the reading.
      if (pingAtRef.current) setLatency(null);
      pingAtRef.current = Date.now();
      channel.send({ type: "broadcast", event: "msg", payload: { type: "ping", t: pingAtRef.current } });
    }, 10000);
    return () => {
      clearInterval(t);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      channelRef.current = null;
      pingAtRef.current = 0;
      supabase.removeChannel(channel);
    };
  }, [room, reconnectNonce]);

  // Kick a reconnect immediately when the tab/network comes back, instead of
  // waiting out the backoff timer.
  useEffect(() => {
    const revive = () => {
      if (!navigator.onLine) return;
      attemptRef.current = 0;
      setReconnectNonce((n) => n + 1);
    };
    const onVisible = () => { if (!document.hidden) revive(); };
    window.addEventListener("online", revive);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", revive);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    // Only auto-scroll if the user is already near the bottom, so scrolling up to
    // read history isn't interrupted by new lines.
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTo({ top: el.scrollHeight });
  }, [lines]);

  const MAX_CMD = 4000;

  const send = () => {
    const text = input.trim().slice(0, MAX_CMD);
    if (!text || !channelRef.current) return;
    if (status !== "on") { log("not connected. command not sent", "sys"); return; }
    try {
      channelRef.current.send({ type: "broadcast", event: "msg", payload: { type: "command", command: text, t: Date.now() } });
      log(`command: ${text}`, "out");
      histRef.current = record(histRef.current, text);
      setInput("");
    } catch { log("failed to send command", "sys"); }
  };

  // ↑/↓ recall through command history in the console input.
  const onCommandKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { send(); return; }
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    // Keep the pure state's view of the current value in sync with the input.
    histRef.current = { ...histRef.current, value: input };
    const next = e.key === "ArrowUp" ? up(histRef.current) : down(histRef.current);
    if (next === histRef.current) return; // no-op (empty history / already at prompt)
    e.preventDefault();
    histRef.current = next;
    setInput(next.value);
  };

  const sendInstruct = () => {
    const text = instruct.trim().slice(0, MAX_CMD);
    if (!text || !channelRef.current) return;
    if (status !== "on") { log("not connected. instruction not sent", "sys"); return; }
    try {
      channelRef.current.send({ type: "broadcast", event: "msg", payload: { type: "command", command: `instruct:${text}`, t: Date.now() } });
      log(`instruct brain: ${text}`, "out");
      setInstruct("");
    } catch { log("failed to send instruction", "sys"); }
  };

  const signOut = async () => {
    if (isDemo) { try { sessionStorage.removeItem(DEMO_FLAG); } catch { /* ignore */ } router.replace("/login"); return; }
    // Always land on /login even if the network sign-out call fails.
    try { await createClient().auth.signOut(); } catch { /* ignore */ }
    router.replace("/login");
  };

  const statusMeta = { on: ["bg-green-500", "Connected"], connecting: ["bg-yellow-500", "Connecting…"], off: ["bg-red-500", "Offline"] }[status];

  // Presence is a heartbeat (~5s). If Termi goes quiet for 20s, drop it so the
  // dashboard doesn't keep claiming "AFK running" / stale terminal counts.
  const PRESENCE_STALE_MS = 20_000;
  // In demo mode the seeded presence never expires (there may be no live Mac).
  const livePresence = isDemo ? presence : (presence && Date.now() - presence.at < PRESENCE_STALE_MS ? presence : null);
  const termiOnline = Boolean(livePresence);
  // Brain status only refreshes each AFK pass (can be minutes), so it can't detect
  // a crash on its own. Gate "running" on the heartbeat: if Termi is offline, the
  // brain can't be actively supervising — don't keep claiming it is.
  const brainRunning = Boolean(brain?.isRunning) && termiOnline;

  if (!room) return <div className="min-h-screen grid place-items-center text-neutral-500">Loading…</div>;

  return (
    <div className="min-h-screen grain">
      <div className="blob1 pointer-events-none fixed -top-40 left-1/4 h-[360px] w-[520px] rounded-full bg-[--color-coral]/10 blur-[130px] -z-10" />
      <header className="sticky top-0 z-30 border-b border-[--color-line] bg-[--color-ink]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span
              className="grid place-items-center w-7 h-7 rounded-[30%]"
              style={{ background: "linear-gradient(135deg, #1a1d1a, #101210)", border: "1px solid var(--color-line-2)" }}
            >
              <BrainGlyph size={15} />
            </span>
            Termi<span className="text-[--color-coral]">.</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {isDemo
              ? <span className="rounded-full bg-[--color-coral]/15 text-[--color-coral] px-2.5 py-0.5 text-xs font-mono">demo mode</span>
              : <span className="text-neutral-400">{email}</span>}
            <button onClick={signOut} className="rounded-lg border border-[--color-line] hover:border-neutral-500 px-3 py-1.5 text-neutral-300 transition">{isDemo ? "Exit demo" : "Sign out"}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 reveal in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your terminal</h1>
            <p className="text-sm text-neutral-500 mt-1">Private room · {room}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${statusMeta[0]}`} />
              <span className="text-neutral-300">{statusMeta[1]}</span>
            </div>
            <span className="text-xs text-neutral-500 tabular-nums">{latency != null ? `${latency} ms` : "— ms"}</span>
          </div>
        </div>

        {isDemo && (
          <div className="mt-6 rounded-xl border border-[--color-coral]/25 bg-[--color-coral]/[0.06] px-4 py-3 text-sm text-[--color-coral]">
            Demo mode — this is seeded data. Sign in to Termi on your Mac with <b>demo / demo</b> to drive this same room live.
          </div>
        )}

        {/* Termi-offline hint: room is connected but no heartbeat is arriving. */}
        {!isDemo && status === "on" && !termiOnline && (
          <div className="mt-6 rounded-xl border border-yellow-500/25 bg-yellow-500/[0.06] px-4 py-3 text-sm text-yellow-200/90">
            Room connected, but no Termi is reporting in. Open Termi on your Mac and make sure it&apos;s signed in to <b>{email}</b>.
          </div>
        )}

        {/* ---- Vitals ---- */}
        <p className="kicker mt-8 mb-3">// vitals</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Vital label="terminals" value={livePresence?.terminalCount ?? "—"} />
          <Vital label="passes" value={brainRunning ? (brain?.pass ?? 0) : "—"} />
          <Vital label="done" value={brain?.terminals.filter(t => t.complete).length ?? 0} tint="text-green-400" />
          <Vital label="blocked" value={brain?.terminals.filter(t => t.blocker).length ?? 0} tint="text-red-400" />
          <Vital label="latency" value={latency != null ? `${latency}ms` : "—"} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[--color-line] bg-[--color-panel] p-4">
            <div className="text-sm font-semibold font-mono truncate">{livePresence?.activeTitle ?? "—"}</div>
            <div className="text-xs text-neutral-500 mt-0.5 truncate">{livePresence?.cwd ?? "active terminal"}</div>
          </div>
          <div className="rounded-xl border border-[--color-line] bg-[--color-panel] p-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${livePresence?.afkRunning ? "bg-[--color-coral] pip" : "bg-neutral-600"}`} />
            <span className="text-sm font-semibold">{livePresence?.afkRunning ? "AFK running" : livePresence ? "Idle" : "Offline"}</span>
            <span className="text-xs text-neutral-500 ml-auto">{livePresence?.provider ?? "brain"}</span>
          </div>
        </div>

        {/* ---- Terminals ---- */}
        <div className="mt-8 flex items-center gap-3">
          <p className="kicker">// terminals</p>
          <span className="text-xs text-neutral-500">
            {brainRunning ? brain?.status : (brain?.isRunning && !termiOnline ? "Termi offline" : "brain idle")}
          </span>
        </div>

        {(brain?.terminals?.length ?? 0) === 0 ? (
          <div className="mt-3 rounded-2xl border border-[--color-line] bg-[--color-panel] p-6 text-sm text-neutral-500">
            No AFK session running. Start AFK mode in Termi (with a goal) and each terminal&apos;s
            progress, tasks, and test checks will stream here as live cards.
          </div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(brain?.terminals ?? []).map((t, i) => (
              <div key={i} className="rounded-2xl border border-[--color-line] bg-[--color-panel] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.complete ? "bg-green-500" : t.blocker ? "bg-red-500" : "bg-[--color-coral] pip"}`} />
                  <span className="font-semibold font-mono text-sm truncate">{t.title}</span>
                  {t.blocker && <span className="text-red-400 text-xs ml-auto">blocked</span>}
                  {t.complete && !t.blocker && <span className="text-green-400 text-xs ml-auto">done</span>}
                </div>
                {t.instruction && <p className="text-xs text-neutral-500">{t.instruction}</p>}
                <p className="text-xs text-neutral-300 leading-relaxed">{t.progress}</p>
                {t.blocker && <p className="text-xs text-red-400/90">⚠ {t.blocker}</p>}
                {t.tests && t.tests.length > 0 && (
                  <div className="mt-auto pt-1 space-y-0.5">
                    {t.tests.map((tc, j) => (
                      <div key={j} className={`text-xs ${tc.passed ? "text-green-500" : "text-red-400"}`}>
                        {tc.passed ? "✓" : "✗"} {tc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instruct brain — always available */}
        <div className="flex gap-2 mt-3">
          <input
            value={instruct}
            onChange={(e) => setInstruct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendInstruct()}
            placeholder="Give the brain new instructions…"
            aria-label="Instruct the brain" autoComplete="off" spellCheck={false} maxLength={4000}
            className="flex-1 rounded-lg border border-[--color-line] bg-[--color-ink] px-3 py-2.5 font-mono text-xs outline-none focus:border-[--color-coral] transition"
          />
          <button onClick={sendInstruct} disabled={status !== "on"} className="rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 text-xs font-semibold transition">Instruct</button>
        </div>

        {/* ---- Monitor: tabbed Console / Brain feed ---- */}
        <p className="kicker mt-8 mb-3">// monitor</p>
        <div className="rounded-2xl border border-[--color-line] bg-[--color-panel] overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 px-4 h-10 border-b border-[--color-line]">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-3 flex gap-1 text-xs">
              <button onClick={() => setTab("console")} className={`px-2.5 py-1 rounded-md font-medium transition ${tab === "console" ? "bg-[--color-coral] text-white" : "text-neutral-400 hover:text-neutral-200"}`}>Console</button>
              <button onClick={() => setTab("brain")} className={`px-2.5 py-1 rounded-md font-medium transition ${tab === "brain" ? "bg-[--color-coral] text-white" : "text-neutral-400 hover:text-neutral-200"}`}>Brain</button>
            </div>
            {tab === "console" && (
              <button onClick={clearLog} disabled={lines.length === 0}
                className="ml-auto text-xs text-neutral-500 hover:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition">Clear</button>
            )}
          </div>

          {tab === "console" ? (
            <>
              <div ref={feedRef} role="log" aria-live="polite" aria-label="Live console output" className="h-[380px] overflow-auto p-4 font-mono text-[13px] leading-relaxed space-y-0.5">
                {lines.length === 0 && <div className="text-neutral-600">No traffic yet. Type a command below.</div>}
                {lines.map((l) => (
                  <div key={l.id} className={l.kind === "out" ? "text-green-400" : l.kind === "sys" ? "text-neutral-500" : "text-neutral-200"}>
                    <span className="select-none text-neutral-700 mr-2 tabular-nums">{clockStamp(l.at)}</span>
                    <span className="select-none text-neutral-600">{l.kind === "out" ? "› " : l.kind === "sys" ? "• " : "‹ "}</span>{l.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-3 border-t border-[--color-line]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onCommandKey}
                  placeholder="Type a command to run in Termi…  (↑/↓ for history)"
                  aria-label="Command to run in Termi" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={4000}
                  className="flex-1 rounded-lg border border-[--color-line] bg-[--color-ink] px-3 py-2.5 font-mono text-sm outline-none focus:border-[--color-coral] transition"
                />
                <button onClick={send} disabled={status !== "on"} className="rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 font-semibold transition">Send</button>
              </div>
            </>
          ) : (
            <div className="h-[380px] overflow-auto p-4 text-sm">
              {!brain ? (
                <div className="text-neutral-600">No brain status yet. Start AFK mode in Termi.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${brainRunning ? "bg-[--color-coral] pip" : "bg-neutral-600"}`} />
                    <span className="font-semibold">{brainRunning ? `Supervising · pass ${brain.pass}` : "Idle"}</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">{brain.status}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {brain.terminals.map((t, i) => (
                      <div key={i} className="rounded-lg bg-[--color-ink] p-3 text-xs">
                        <span className="font-mono font-semibold">{t.title}</span>
                        <p className="text-neutral-400 mt-1">{t.progress}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          Commands run in Termi&apos;s active terminal on your Mac. Make sure Termi is signed in to the same account.
        </p>
      </main>
    </div>
  );
}

/** One vitals stat tile. */
function Vital({ label, value, tint }: { label: string; value: string | number; tint?: string }) {
  return (
    <div className="rounded-xl border border-[--color-line] bg-[--color-panel] p-4">
      <div className={`text-2xl font-bold tabular-nums ${tint ?? ""}`}>{value}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}
