"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Line = { id: number; text: string; kind: "in" | "out" | "sys" };

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "on" | "off">("connecting");
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const pingAtRef = useRef(0);

  const log = (text: string, kind: Line["kind"]) =>
    setLines((p) => [...p.slice(-499), { id: idRef.current++, text, kind }]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setEmail(data.user.email ?? null);
      setRoom(`termi:${data.user.id}`);
    });
  }, [router]);

  useEffect(() => {
    if (!room) return;
    const supabase = createClient();
    const channel = supabase.channel(room, { config: { broadcast: { self: false } } });
    channelRef.current = channel;
    channel.on("broadcast", { event: "msg" }, ({ payload }) => {
      const p = payload as Record<string, unknown>;
      if (p.type === "pong") { if (pingAtRef.current) setLatency(Date.now() - pingAtRef.current); pingAtRef.current = 0; return; }
      log(`${(p.type as string) || "message"}: ${(p.message as string) ?? JSON.stringify(p)}`, "in");
    });
    channel.subscribe((s) => {
      if (s === "SUBSCRIBED") { setStatus("on"); log("connected to your terminal room", "sys"); }
      else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("off");
    });
    const t = setInterval(() => {
      pingAtRef.current = Date.now();
      channel.send({ type: "broadcast", event: "msg", payload: { type: "ping", t: pingAtRef.current } });
    }, 10000);
    return () => { clearInterval(t); supabase.removeChannel(channel); };
  }, [room]);

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }); }, [lines]);

  const send = () => {
    const text = input.trim();
    if (!text || !channelRef.current) return;
    channelRef.current.send({ type: "broadcast", event: "msg", payload: { type: "command", command: text, t: Date.now() } });
    log(`command: ${text}`, "out");
    setInput("");
  };

  const signOut = async () => { await createClient().auth.signOut(); router.replace("/login"); };

  const statusMeta = { on: ["bg-green-500", "Connected"], connecting: ["bg-yellow-500", "Connecting…"], off: ["bg-red-500", "Offline"] }[status];

  if (!room) return <div className="min-h-screen grid place-items-center text-neutral-500">Loading…</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[--color-line]">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white text-sm">›_</span>
            Termi
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-400">{email}</span>
            <button onClick={signOut} className="rounded-lg border border-[--color-line] hover:border-neutral-500 px-3 py-1.5 text-neutral-300 transition">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
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

        {/* Console */}
        <div className="mt-6 rounded-2xl border border-[--color-line] bg-[--color-panel] overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 px-4 h-9 border-b border-[--color-line]">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-neutral-500">live console</span>
          </div>
          <div ref={feedRef} className="h-[380px] overflow-auto p-4 font-mono text-[13px] leading-relaxed space-y-0.5">
            {lines.length === 0 && <div className="text-neutral-600">No traffic yet — type a command below.</div>}
            {lines.map((l) => (
              <div key={l.id} className={l.kind === "out" ? "text-green-400" : l.kind === "sys" ? "text-neutral-500" : "text-neutral-200"}>
                <span className="select-none text-neutral-600">{l.kind === "out" ? "› " : l.kind === "sys" ? "• " : "‹ "}</span>{l.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-[--color-line]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a command to run in Termi…"
              className="flex-1 rounded-lg border border-[--color-line] bg-[--color-ink] px-3 py-2.5 font-mono text-sm outline-none focus:border-[--color-coral] transition"
            />
            <button onClick={send} className="rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] text-white px-5 font-semibold transition">Send</button>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          Commands run in Termi&apos;s active terminal on your Mac. Make sure Termi is signed in to the same account.
        </p>
      </main>
    </div>
  );
}
