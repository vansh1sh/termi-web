"use client";

/**
 * A cluster of AI-agent "avatars" Termi can drive. Each is a monogram tile
 * with a glow and a live status pip; they float on staggered clocks and lift
 * on hover. Used in the "works with your agents" section.
 */

type A = { label: string; mono: string; hue: string };

const AGENTS: A[] = [
  { label: "Claude Code", mono: "C", hue: "#f07a52" },
  { label: "Codex", mono: "◇", hue: "#5ed6a4" },
  { label: "Gemini", mono: "✦", hue: "#6aa9ff" },
  { label: "Aider", mono: "A", hue: "#f5b544" },
  { label: "Cursor CLI", mono: "»", hue: "#c58cff" },
  { label: "Your shell", mono: "›_", hue: "#9aa0ad" },
];

export default function AgentAvatars() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {AGENTS.map((a, i) => (
        <div key={a.label} className="group drift flex flex-col items-center gap-2" style={{ animationDelay: `${(i % 3) * 0.6}s` }}>
          <div
            className="relative grid place-items-center h-16 w-16 rounded-2xl border bg-white/[0.03] backdrop-blur transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-105"
            style={{ borderColor: `${a.hue}55`, boxShadow: `0 0 26px ${a.hue}22` }}
          >
            <span className="text-2xl font-bold font-mono" style={{ color: a.hue }}>{a.mono}</span>
            <span
              className="pip absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-[--color-ink]"
              style={{ background: a.hue, animationDelay: `${i * 0.25}s` }}
            />
            {/* sheen sweep on hover */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </span>
          </div>
          <span className="text-xs text-neutral-400 group-hover:text-white transition">{a.label}</span>
        </div>
      ))}
    </div>
  );
}
