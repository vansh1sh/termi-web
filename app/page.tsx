import Link from "next/link";
import Reveal from "./components/Reveal";
import TypingTerminal from "./components/TypingTerminal";
import DownloadButton from "./components/DownloadButton";
import OrchestraHero from "./components/OrchestraHero";
import AgentAvatars from "./components/AgentAvatars";
import CountUp from "./components/CountUp";
import ConsolePreview from "./components/ConsolePreview";
import FAQ from "./components/FAQ";
import NavLinks from "./components/NavLinks";
import InteractiveBackdrop from "./components/InteractiveBackdrop";
import Parallax from "./components/Parallax";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Pointer-reactive + scroll-parallax backdrop (dotted grid + coral glow). */}
      <InteractiveBackdrop />

      <a href="#content" className="skip-link">Skip to content</a>
      <Nav />
      <main id="content">
        <Hero />
        <LogoRow />
        <Orchestra />
        <Stats />
        <Features />
        <Console />
        <Agents />
        <HowItWorks />
        <FAQ />
        <DownloadCTA />
      </main>
      <Footer />
    </div>
  );
}

/* Shared: mono section eyebrow with an index. */
function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="kicker flex items-center gap-2">
      <span className="text-[--color-faint]">{n}</span>
      <span className="h-px w-6 bg-[--color-line-2]" />
      {children}
    </div>
  );
}

function Brand({ size = 8 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-md bg-[--color-coral] text-white"
      style={{ width: size * 4, height: size * 4 }}
    >
      <svg width={size * 1.9} height={size * 1.9} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l6-6-6-6" /><path d="M12 19h8" />
      </svg>
    </span>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[--color-ink]/70 border-b border-[--color-line]">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Brand size={7} />
          <span>Termi</span>
          <span className="hidden sm:inline font-mono text-[11px] text-[--color-faint] border border-[--color-line] rounded px-1.5 py-0.5 ml-1">v1.0</span>
        </Link>
        <div className="flex items-center gap-5 sm:gap-7 text-sm text-[--color-muted]">
          <NavLinks />
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
          <div className="hidden sm:block"><DownloadButton /></div>
        </div>
      </nav>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
      <div>
        <Reveal>
          <Kicker n="//">terminal workstation</Kicker>
        </Reveal>
        <Reveal>
          <h1 className="mt-6 text-5xl sm:text-[3.7rem] font-semibold tracking-[-0.02em] leading-[1.04]">
            The terminal that
            <br />
            runs itself — <span className="text-[--color-coral]">you supervise.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-lg text-[--color-muted] max-w-xl leading-relaxed">
            Termi is a native Mac terminal with an AI brain that plans, executes, and
            verifies your work across many terminals at once — and lets you watch and
            steer every one of them from any browser.
          </p>
        </Reveal>
        <Reveal>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <DownloadButton large />
            <a href="#how" className="rounded-lg border border-[--color-line-2] hover:border-[--color-muted] px-6 py-4 font-medium transition text-[--color-fg]">
              How it works
            </a>
          </div>
          <p className="mt-4 font-mono text-xs text-[--color-faint]">$ free · macOS 14+ · apple silicon</p>
        </Reveal>
      </div>

      <Reveal variant="reveal-scale">
        <Parallax speed={4} className="ticks">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <TypingTerminal />
        </Parallax>
      </Reveal>
    </section>
  );
}

/* ---------------- Logo / trust row ---------------- */
function LogoRow() {
  const items = ["Claude Code", "Codex", "Gemini", "Aider", "Cursor CLI", "your shell"];
  return (
    <div className="border-y border-[--color-line]">
      <div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-2 justify-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--color-faint]">drives</span>
        {items.map((t) => (
          <span key={t} className="font-mono text-sm text-[--color-muted]">{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Orchestra (animated centerpiece) ---------------- */
function Orchestra() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
      <Reveal variant="reveal-scale" className="order-2 lg:order-1">
        <Parallax speed={5}><OrchestraHero /></Parallax>
      </Reveal>
      <div className="order-1 lg:order-2">
        <Reveal><Kicker n="01">orchestration</Kicker></Reveal>
        <Reveal>
          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            One brain. Many terminals. In parallel.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mt-5 text-lg text-[--color-muted] max-w-xl leading-relaxed">
            Assign a job to each terminal in plain English — <span className="font-mono text-[--color-fg] text-base">term-1 builds, term-2 tests, term-3 runs the sim</span> —
            and the brain dispatches, watches, and course-corrects every one until the goal is met.
          </p>
        </Reveal>
        <Reveal variant="stagger" className="mt-8 space-y-3">
          {["Understands per-terminal intent", "Verifies with real tests before ‘done’", "Streams a live summary you can steer"].map((t) => (
            <div key={t} className="flex items-center gap-3 text-[--color-fg]">
              <span className="font-mono text-[--color-coral] text-sm">✓</span>
              <span className="text-[15px]">{t}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Stats band ---------------- */
function Stats() {
  return (
    <div className="border-y border-[--color-line] bg-[--color-panel]/40">
      <Reveal variant="stagger" className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-[--color-line]">
        {STATS.map((s) => (
          <div key={s.label} className="px-6 py-12 text-center">
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-[--color-fg]">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </div>
            <div className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-[--color-faint]">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </div>
  );
}

/* ---------------- Features (spec-sheet grid) ---------------- */
function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <Kicker n="02">capabilities</Kicker>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
          Everything a serious builder needs — in one native app.
        </h2>
      </Reveal>
      <Reveal variant="stagger" className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[--color-line]">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="group relative border-r border-b border-[--color-line] p-7 hover:bg-[--color-panel]/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-[--color-coral]">{f.glyph}</span>
              <span className="font-mono text-xs text-[--color-faint]">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-5 font-semibold text-[17px] tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm text-[--color-muted] leading-relaxed">{f.body}</p>
            <span className="absolute left-0 bottom-[-1px] h-px w-0 bg-[--color-coral] group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------------- Console preview ---------------- */
function Console() {
  return (
    <section className="border-y border-[--color-line] bg-[--color-panel]/30">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Reveal>
          <Kicker n="03">web console</Kicker>
          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
            Your build, live in the browser.
          </h2>
          <p className="mt-4 text-lg text-[--color-muted] max-w-2xl leading-relaxed">
            Sign in at termi-web to watch the brain&apos;s activity, every terminal&apos;s progress, and
            the live traffic — then type an instruction and steer it, from your phone or laptop.
          </p>
        </Reveal>
        <Reveal variant="reveal-scale" className="mt-12 ticks">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <ConsolePreview />
        </Reveal>
        <Reveal className="mt-6">
          <Link href="/login" className="font-mono text-sm text-[--color-coral] hover:underline">→ open the web console</Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Agents ---------------- */
function Agents() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <Reveal>
        <div className="flex justify-center"><Kicker n="04">compatibility</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">Bring your own agent</h2>
        <p className="mt-4 text-lg text-[--color-muted] max-w-xl mx-auto leading-relaxed">Termi drives whatever CLI you already use — or just your plain shell.</p>
      </Reveal>
      <Reveal variant="reveal" className="mt-12">
        <AgentAvatars />
      </Reveal>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  return (
    <section id="how" className="border-t border-[--color-line]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <Kicker n="05">workflow</Kicker>
          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">Set a goal. Walk away.</h2>
        </Reveal>
        <Reveal variant="stagger" className="mt-12 grid sm:grid-cols-3 gap-px bg-[--color-line] border border-[--color-line]">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-[--color-ink] p-8">
              <div className="font-mono text-sm text-[--color-coral]">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-4 font-semibold text-[17px] tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm text-[--color-muted] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Download CTA ---------------- */
function DownloadCTA() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal variant="reveal-scale">
        <div className="ticks relative border border-[--color-line-2] bg-[--color-panel]/60 px-8 py-16 sm:px-16 text-center overflow-hidden">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <div className="absolute inset-0 dotgrid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative">
            <div className="flex justify-center mb-6"><Brand size={12} /></div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Download Termi</h2>
            <p className="mt-4 text-[--color-muted]">Native macOS app. Free. Bring your own AI CLI.</p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <DownloadButton large />
              <span className="font-mono text-xs text-[--color-faint]">
                requires macOS 14+ · <Link href="/login" className="text-[--color-coral] hover:underline">sign in to the web console →</Link>
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[--color-line]">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 font-semibold">
            <Brand size={7} /> Termi
          </div>
          <p className="mt-4 text-sm text-[--color-muted] max-w-xs leading-relaxed">
            The terminal that runs itself. An autonomous brain across many terminals — supervised from anywhere.
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[--color-faint]">{col.title}</div>
            <ul className="mt-4 space-y-2.5 text-sm text-[--color-muted]">
              {col.links.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-[--color-fg] transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[--color-line]">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[--color-faint]">
          <span>© 2026 Termi — built for builders who ship.</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 pip" /> all systems operational</span>
        </div>
      </div>
    </footer>
  );
}

const FOOTER_COLS = [
  { title: "Product", links: [{ label: "Capabilities", href: "#features" }, { label: "How it works", href: "#how" }, { label: "Web console", href: "/login" }, { label: "Download", href: "#download" }] },
  { title: "Agents", links: [{ label: "Claude Code", href: "#" }, { label: "Codex", href: "#" }, { label: "Gemini", href: "#" }, { label: "Your shell", href: "#" }] },
  { title: "More", links: [{ label: "FAQ", href: "#faq" }, { label: "Sign in", href: "/login" }] },
];

// Mono glyph markers instead of emoji — reads like a technical spec sheet.
const FEATURES = [
  { glyph: "◇", title: "AFK Autopilot", body: "Set a goal and walk away. The brain drives your terminal and verifies with real tests before calling it done." },
  { glyph: "⊞", title: "Multi-terminal", body: "Fan work across terminals — term-1 does X, term-2 does Y — orchestrated in parallel by one brain." },
  { glyph: "✓", title: "Verifies, not guesses", body: "Builds, runs the suite, serves + curls web apps, boots the simulator — ‘done’ means actually done." },
  { glyph: "◉", title: "Web console", body: "Sign in on the web to run commands, watch live output, and steer the brain from any browser." },
  { glyph: "›_", title: "Native Mac terminal", body: "A real PTY terminal with splits, tabs, and a focused UI — not an Electron wrapper." },
  { glyph: "◎", title: "Cling coach", body: "A floating coach that reads any app via accessibility and can click through steps for you." },
];

const STEPS = [
  { title: "Download & open", body: "Grab the Mac app and pick your AI CLI — Claude Code, Codex, or Gemini." },
  { title: "Set a goal", body: "Tell AFK mode what to build and for how long. Complex? Assign a task per terminal." },
  { title: "Watch from anywhere", body: "Sign in on the web to see live progress, test checks, and steer the brain." },
];

const STATS: { value: number; label: string; prefix?: string; suffix?: string; decimals?: number }[] = [
  { value: 100, suffix: "X", label: "throughput" },
  { value: 12, suffix: "+", label: "parallel terminals" },
  { value: 0, label: "context switches" },
  { value: 24, suffix: "/7", label: "autonomous runs" },
];
