import Link from "next/link";
import Reveal from "./components/Reveal";
import TypingTerminal from "./components/TypingTerminal";
import DownloadButton from "./components/DownloadButton";
import ConsolePreview from "./components/ConsolePreview";
import FAQ from "./components/FAQ";
import NavLinks from "./components/NavLinks";
import NeuralNet from "./components/NeuralNet";
import Parallax from "./components/Parallax";
import GlowBrain from "./components/GlowBrain";
import CursorGlow from "./components/CursorGlow";
import Reveal3D from "./components/Reveal3D";
import AppShowcase from "./components/AppShowcase";
import TiltStage from "./components/TiltStage";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* "Second Brain" — living neural field + page-wide pointer glow behind everything. */}
      <NeuralNet />
      <CursorGlow />

      <a href="#content" className="skip-link">Skip to content</a>
      <Nav />
      <main id="content">
        <Hero />
        <Showcase />
        <Orchestra />
        <Console />
        <Features />
        <HowItWorks />
        <FAQ />
        <DownloadCTA />
      </main>
      <Footer />
    </div>
  );
}

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="kicker flex items-center gap-2">
      <span className="text-[--color-faint]">{n}</span>
      <span className="h-px w-6 bg-[--color-line-2]" />
      {children}
    </div>
  );
}

function Brand({ size = 7 }: { size?: number }) {
  return (
    <span className="grid place-items-center rounded-md bg-[--color-coral] text-white" style={{ width: size * 4, height: size * 4 }}>
      <svg width={size * 1.9} height={size * 1.9} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l6-6-6-6" /><path d="M12 19h8" />
      </svg>
    </span>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Brand /> <span>Termi</span>
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
    <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 grid lg:grid-cols-[1fr_1fr] gap-14 items-center">
      <div>
        <Reveal><Kicker n="//">a second brain for your terminal</Kicker></Reveal>
        <Reveal>
          <h1 className="mt-6 text-5xl sm:text-[3.7rem] font-semibold tracking-[-0.02em] leading-[1.05]">
            Think it.
            <br />
            <span className="text-[--color-coral]">Termi builds it.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-lg text-[--color-muted] max-w-md leading-relaxed">
            A native Mac terminal with an AI brain that runs your work across many
            terminals — and lets you steer it from any browser.
          </p>
        </Reveal>
        <Reveal>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DownloadButton large />
            <a href="#how" className="rounded-lg glass hover:border-[--color-muted] px-6 py-4 font-medium transition">How it works</a>
          </div>
          <p className="mt-4 font-mono text-xs text-[--color-faint]">$ free · macOS 14+ · apple silicon</p>
        </Reveal>
      </div>

      <Reveal variant="reveal-scale">
        <Parallax speed={3}><GlowBrain /></Parallax>
      </Reveal>
    </section>
  );
}

/* ---------------- Showcase (framed app screenshot) ---------------- */
function Showcase() {
  return (
    <section className="mx-auto max-w-5xl px-6 -mt-4 pb-16">
      <Reveal3D>
        <TiltStage>
          <AppShowcase />
        </TiltStage>
      </Reveal3D>
      <Reveal className="mt-6 text-center">
        <span className="font-mono text-xs text-[--color-faint]">the native macOS app · 2×2 terminal grid supervised by the brain</span>
      </Reveal>
    </section>
  );
}

/* ---------------- Orchestra ---------------- */
function Orchestra() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
      <Reveal3D className="order-2 lg:order-1">
        <Parallax speed={4} className="ticks">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <div className="glass-strong rounded-2xl overflow-hidden"><TypingTerminal /></div>
        </Parallax>
      </Reveal3D>
      <div className="order-1 lg:order-2">
        <Reveal3D>
          <Kicker n="01">one brain · many neurons</Kicker>
          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Every terminal is a neuron. One brain fires them all.
          </h2>
          <p className="mt-4 text-lg text-[--color-muted] max-w-xl leading-relaxed">
            Assign a job to each in plain English — <span className="font-mono text-[--color-fg] text-base">term-1 builds, term-2 tests, term-3 ships</span> —
            and Termi dispatches, watches, and verifies every one in parallel.
          </p>
        </Reveal3D>
        <Reveal3D delay={120} className="mt-8 grid gap-3">
          {["Understands per-terminal intent", "Verifies with real tests", "Live summary you can steer"].map((t, i) => (
            <div key={t} className="glass rounded-xl p-4 flex items-center gap-3 card3d">
              <span className="font-mono text-sm text-[--color-coral]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] text-[--color-fg]">{t}</span>
            </div>
          ))}
        </Reveal3D>
      </div>
    </section>
  );
}

/* ---------------- Console ---------------- */
function Console() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <Reveal3D className="text-center">
        <div className="flex justify-center"><Kicker n="02">web console</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">Your build, live in the browser.</h2>
        <p className="mt-4 text-lg text-[--color-muted] max-w-xl mx-auto leading-relaxed">
          Watch the brain, every terminal&apos;s progress, and the live traffic — then steer it from your phone.
        </p>
      </Reveal3D>
      <Reveal3D delay={120} className="mt-10 ticks">
        <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
        <div className="glass-strong rounded-2xl overflow-hidden"><ConsolePreview /></div>
      </Reveal3D>
      <Reveal className="mt-6 text-center">
        <Link href="/login" className="font-mono text-sm text-[--color-coral] hover:underline">→ open the web console</Link>
      </Reveal>
    </section>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal3D>
        <div className="flex justify-center"><Kicker n="03">capabilities</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-center">One app. Everything you ship with.</h2>
      </Reveal3D>
      <Reveal variant="stagger" className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="glass rounded-xl p-6 card3d">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-[--color-coral]">{f.glyph}</span>
              <span className="font-mono text-xs text-[--color-faint]">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-5 font-semibold text-[16px] tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm text-[--color-muted] leading-relaxed">{f.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-6 py-20">
      <Reveal3D>
        <div className="flex justify-center"><Kicker n="04">workflow</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-center">Set a goal. Walk away.</h2>
      </Reveal3D>
      <Reveal variant="stagger" className="mt-12 grid sm:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="glass rounded-xl p-6">
            <div className="font-mono text-sm text-[--color-coral]">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-4 font-semibold text-[16px] tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm text-[--color-muted] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------------- Download CTA ---------------- */
function DownloadCTA() {
  return (
    <section id="download" className="mx-auto max-w-4xl px-6 py-24">
      <Reveal variant="reveal-scale">
        <div className="ticks glass-strong rounded-2xl px-8 py-16 text-center">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <div className="flex justify-center mb-6"><Brand size={12} /></div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Give your terminal a brain.</h2>
          <p className="mt-4 text-[--color-muted]">Native macOS app. Free. Bring your own AI CLI.</p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <DownloadButton large />
            <span className="font-mono text-xs text-[--color-faint]">
              macOS 14+ · <Link href="/login" className="text-[--color-coral] hover:underline">open the web console →</Link>
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[--color-line]">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-semibold"><Brand /> Termi</div>
        <div className="flex items-center gap-6 text-sm text-[--color-muted]">
          <a href="#features" className="hover:text-[--color-fg] transition">Capabilities</a>
          <a href="#how" className="hover:text-[--color-fg] transition">How it works</a>
          <a href="#faq" className="hover:text-[--color-fg] transition">FAQ</a>
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
        </div>
        <span className="font-mono text-xs text-[--color-faint]">© 2026 Termi</span>
      </div>
    </footer>
  );
}

const FEATURES = [
  { glyph: "◇", title: "AFK Autopilot", body: "Set a goal and walk away. The brain drives and verifies before it calls done." },
  { glyph: "⊞", title: "Multi-terminal", body: "Fan work across terminals, orchestrated in parallel by one brain." },
  { glyph: "✓", title: "Verifies, not guesses", body: "Builds, tests, curls, boots the sim — done means actually done." },
  { glyph: "◉", title: "Web console", body: "Run, watch, and steer the brain from any browser." },
  { glyph: "›_", title: "Native Mac terminal", body: "A real PTY with splits and tabs — not an Electron wrapper." },
  { glyph: "◎", title: "Cling coach", body: "A floating coach that reads any app and clicks through steps for you." },
];

const STEPS = [
  { title: "Download & open", body: "Grab the app, pick your CLI — Claude Code, Codex, or Gemini." },
  { title: "Set a goal", body: "Tell AFK mode what to build. Complex? Assign a task per terminal." },
  { title: "Watch anywhere", body: "Sign in on the web for live progress and control." },
];
