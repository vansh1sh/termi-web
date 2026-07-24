/**
 * Termi logo mark: a rounded "synapse" tile — a terminal prompt chevron that
 * fires into a glowing node (the caret becomes a neuron). Fuses the two ideas
 * the product is about: a terminal + a brain.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="tm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7935f" />
          <stop offset="1" stopColor="#db5c30" />
        </linearGradient>
        <radialGradient id="tm-node" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#ffd9b8" />
        </radialGradient>
      </defs>
      {/* tile */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#tm-bg)" />
      <rect x="1" y="1" width="38" height="38" rx="11" fill="black" opacity="0.06" />
      {/* prompt chevron */}
      <path d="M12 13l7 7-7 7" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* synapse line into the node */}
      <path d="M22 27h3.5" stroke="white" strokeWidth="3.4" strokeLinecap="round" opacity="0.9" />
      {/* firing node (neuron) */}
      <circle cx="29.5" cy="27" r="3.1" fill="url(#tm-node)" />
      <circle cx="29.5" cy="27" r="5.4" fill="#fff" opacity="0.18" />
    </svg>
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
