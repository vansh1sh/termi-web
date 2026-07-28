"use client";

import { useEffect, useState } from "react";

type Row = { text: string; kind: "in" | "out" | "ok" | "run" };

// A scripted terminal session that types itself out, loops forever.
const SCRIPT: Row[] = [
  { text: "termi › build me a landing page and ship it", kind: "in" },
  { text: "⏺ planning · 4 milestones", kind: "run" },
  { text: "⏺ writing app/page.tsx …", kind: "run" },
  { text: "⏺ npm run build", kind: "run" },
  { text: "✓ compiled, 0 errors", kind: "ok" },
  { text: "⏺ verifying: curl localhost:3000 → 200 OK", kind: "run" },
  { text: "✓ shipped. preview is live.", kind: "ok" },
];

export default function TypingTerminal() {
  const [rows, setRows] = useState<Row[]>([]);
  const [typing, setTyping] = useState("");
  const [ri, setRi] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Respect reduced-motion: show the finished session statically, no timers.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) { setRows(SCRIPT.slice(-6)); setTyping(""); return; }
    let cancelled = false;
    // Pause the loop while the tab is hidden; resume when visible.
    if (typeof document !== "undefined" && document.hidden) return;
    const row = SCRIPT[ri % SCRIPT.length];
    if (row.kind === "in") {
      // type char-by-char
      let i = 0;
      const iv = setInterval(() => {
        if (cancelled) return;
        i++;
        setTyping(row.text.slice(0, i));
        if (i >= row.text.length) {
          clearInterval(iv);
          setTimeout(() => { if (cancelled) return; setRows((r) => [...r.slice(-6), row]); setTyping(""); advance(); }, 350);
        }
      }, 34);
      return () => { cancelled = true; clearInterval(iv); };
    } else {
      const t = setTimeout(() => { if (cancelled) return; setRows((r) => [...r.slice(-6), row]); advance(); }, 620);
      return () => { cancelled = true; clearTimeout(t); };
    }
    function advance() {
      setRi((n) => {
        const next = n + 1;
        // Reset the visible log at the start of each loop for a clean re-type.
        if (next % SCRIPT.length === 0) setTimeout(() => !cancelled && setRows([]), 1400);
        return next;
      });
    }
  }, [ri, reduced]);

  // When the tab returns to the foreground, nudge the loop back to life.
  useEffect(() => {
    const onVis = () => { if (!document.hidden) setRi((n) => n + 1); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const color = (k: Row["kind"]) =>
    k === "in" ? "text-neutral-200" : k === "ok" ? "text-green-400" : k === "run" ? "text-amber-300" : "text-neutral-400";

  return (
    <div aria-hidden className="rounded-2xl border border-[--color-line] bg-black/40 backdrop-blur shadow-2xl overflow-hidden bob">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-[--color-line] bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-neutral-500">termi · autopilot</span>
        <span className="ml-auto text-[10px] text-green-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 caret" /> live
        </span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed h-64 overflow-hidden">
        {rows.map((r, i) => (
          <div key={i} className={color(r.kind)}>{r.text}</div>
        ))}
        {typing && (
          <div className="text-neutral-200">{typing}<span className="caret">▋</span></div>
        )}
      </div>
    </div>
  );
}
