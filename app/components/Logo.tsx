/**
 * Termi logo mark: a white line-art brain on a dark rounded tile — the product
 * IS the brain above your terminals. A faint coral synapse node glows in the
 * center so the mark still carries the brand accent.
 */
export function BrainGlyph({
  size = 22,
  stroke = "white",
  strokeWidth = 1.9,
}: {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* two hemispheres */}
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      {/* midline fold */}
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      {/* gyri details */}
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  const glyph = Math.round(size * 0.62);
  return (
    <span
      className="inline-flex items-center justify-center rounded-[30%] relative"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1a1d1a, #101210)",
        border: "1px solid var(--color-line-2)",
        boxShadow: "0 0 18px rgba(240,118,74,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-hidden
    >
      {/* soft coral synapse glow behind the brain */}
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: "radial-gradient(circle, rgba(240,118,74,0.35), transparent 70%)",
        }}
      />
      <BrainGlyph size={glyph} />
    </span>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <LogoMark size={size} />
      <span className="text-[1.05rem]">
        Termi<span className="text-[--color-coral]">.</span>
      </span>
    </span>
  );
}
