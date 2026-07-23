"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Line = { id: number; text: string; kind: "in" | "out" | "sys" };

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "on" | "off">("connecting");
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const idRef = useRef(0);
  const pingAtRef = useRef(0);

  const log = (text: string, kind: Line["kind"]) =>
    setLines((prev) => [...prev.slice(-499), { id: idRef.current++, text, kind }]);

  // Require login; derive the room from the authenticated user id.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setEmail(data.user.email ?? null);
      setRoom(`termi:${data.user.id}`);
    });
  }, [router]);

  // Once we have a room, join the realtime channel.
  useEffect(() => {
    if (!room) return;
    const supabase = createClient();
    const channel = supabase.channel(room, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    channel.on("broadcast", { event: "msg" }, ({ payload }) => {
      const p = payload as Record<string, unknown>;
      if (p.type === "pong") {
        if (pingAtRef.current) setLatency(Date.now() - pingAtRef.current);
        pingAtRef.current = 0;
        return;
      }
      const label = (p.type as string) || "message";
      const body = (p.message as string) ?? JSON.stringify(p);
      log(`${label}: ${body}`, "in");
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

  const send = () => {
    const text = input.trim();
    if (!text || !channelRef.current) return;
    channelRef.current.send({
      type: "broadcast", event: "msg",
      payload: { type: "command", command: text, t: Date.now() },
    });
    log(`command: ${text}`, "out");
    setInput("");
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const dot = status === "on" ? "#3fb950" : status === "connecting" ? "#d29922" : "#f85149";

  if (!room) {
    return <main style={{ maxWidth: 720, margin: "80px auto", padding: 24, color: "#9aa0aa" }}>Loading…</main>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Termi — Web Connector</h1>
        <button onClick={signOut} style={{ background: "none", border: "1px solid #2a2d34", color: "#9aa0aa", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
          Sign out
        </button>
      </div>
      <p style={{ color: "#9aa0aa", fontSize: 13 }}>Signed in as {email} · your private terminal room</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: dot, display: "inline-block" }} />
        <span style={{ fontSize: 13 }}>{status}</span>
        <span style={{ fontSize: 12, color: "#9aa0aa" }}>{latency != null ? `${latency} ms` : "— ms"}</span>
      </div>

      <div style={{ height: 320, overflow: "auto", background: "#16181d", borderRadius: 10, padding: 12, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
        {lines.length === 0 && <div style={{ color: "#6b7280" }}>No traffic yet…</div>}
        {lines.map((l) => (
          <div key={l.id} style={{ color: l.kind === "out" ? "#3fb950" : l.kind === "sys" ? "#6b7280" : "#e7e9ee" }}>
            {l.kind === "out" ? "› " : l.kind === "sys" ? "• " : "‹ "}{l.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a command to run in Termi…"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2d34", background: "#0e0f12", color: "#e7e9ee", fontFamily: "ui-monospace, monospace" }}
        />
        <button onClick={send} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#f07a52", color: "#fff", fontWeight: 600 }}>
          Send
        </button>
      </div>
    </main>
  );
}
