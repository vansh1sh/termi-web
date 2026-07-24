"use client";

/**
 * A framed, shadowed mock of the Termi desktop app so visitors see what it
 * looks like: title bar, sidebar with terminal sessions + an AFK supervision
 * badge, and a 2×2 grid of terminals mid-run. Pure markup (no real screenshot
 * asset needed) styled to match the product.
 */

const SESSIONS = [
  { name: "2 Terminals", active: true },
  { name: "web · build", dot: "#f0764a" },
  { name: "api · tests", dot: "#5ed6a4" },
  { name: "sim · verify", dot: "#6aa9ff" },
];

const PANES = [
  { title: "term-1 · build", hue: "#f0764a", lines: ["$ npm run build", "▸ compiling routes…", "✓ built in 4.2s", "✓ 0 errors"] },
  { title: "term-2 · tests", hue: "#5ed6a4", lines: ["$ jest --watch", "PASS  auth.test.ts", "PASS  api.test.ts", "✓ 24 passing"] },
  { title: "term-3 · sim", hue: "#6aa9ff", lines: ["$ xcrun simctl boot", "▸ booting iPhone 15…", "▸ curl :3000 → 200", "✓ live"] },
  { title: "term-4 · ship", hue: "#e6a23c", lines: ["$ git push", "▸ opening PR #142", "▸ deploying…", "✓ shipped"] },
];

export default function AppShowcase() {
  return (
    <div className="sheen relative rounded-2xl border border-[--color-line-2] bg-[--color-panel] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_60px_-10px_rgba(240,118,74,0.15)] overflow-hidden">
      {/* title bar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-[--color-line] bg-[--color-panel-2]">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-[--color-muted]">Termi — supervising · AFK 12:40 left</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-[--color-coral]">
          <span className="w-1.5 h-1.5 rounded-full bg-[--color-coral] pip" /> brain active
        </span>
      </div>

      <div className="grid grid-cols-[150px_1fr] min-h-[300px]">
        {/* sidebar */}
        <div className="border-r border-[--color-line] p-3 bg-[--color-panel-2]/50 hidden sm:block">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[--color-faint] mb-3 px-1">sessions</div>
          <div className="space-y-1">
            {SESSIONS.map((s) => (
              <div
                key={s.name}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                  s.active ? "bg-[--color-coral]/15 text-[--color-fg]" : "text-[--color-muted]"
                }`}
              >
                {s.dot ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} /> : <span className="font-mono text-[--color-coral]">›</span>}
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[--color-coral]/30 bg-[--color-coral]/10 p-2.5">
            <div className="font-mono text-[10px] text-[--color-coral]">AFK MODE</div>
            <div className="mt-1 text-[11px] text-[--color-muted] leading-snug">Ship the release. Verify on sim.</div>
            <div className="mt-2 h-1 rounded-full bg-black/40 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[--color-coral]" />
            </div>
          </div>
        </div>

        {/* 2×2 terminal grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-px bg-[--color-line]">
          {PANES.map((p) => (
            <div key={p.title} className="bg-[--color-ink] p-3 font-mono text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.hue }} />
                <span className="text-[10px]" style={{ color: p.hue }}>{p.title}</span>
              </div>
              {p.lines.map((l) => (
                <div key={l} className={l.startsWith("✓") ? "text-green-400" : l.startsWith("$") ? "text-[--color-fg]" : "text-[--color-muted]"}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
