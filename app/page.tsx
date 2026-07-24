import Link from "next/link";
import Reveal from "./components/Reveal";
import TypingTerminal from "./components/TypingTerminal";
import DownloadButton from "./components/DownloadButton";
import ConsolePreview from "./components/ConsolePreview";
import FAQ from "./components/FAQ";
import NavLinks from "./components/NavLinks";
import NeuralNet from "./components/NeuralNet";
import Parallax from "./components/Parallax";
import CursorGlow from "./components/CursorGlow";
import AppShowcase from "./components/AppShowcase";
import TiltStage from "./components/TiltStage";
import Hero from "./components/Hero";
import { Logo } from "./components/Logo";

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
        <FAQ />
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

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <Link href="/" aria-label="Termi home">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-5 sm:gap-7 text-sm text-[--color-muted]">
          <NavLinks />
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
          <a href="#content" className="hidden sm:inline-flex items-center gap-1.5 text-[--color-fg] hover:text-[--color-coral] transition font-medium">
            Download
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M7 10l5 5 5-5M4 21h16"/></svg>
          </a>
        </div>
      </nav>
    </header>
  );
}


/* ---------------- Showcase (framed app screenshot) ---------------- */
function Showcase() {
  return (
    <section className="mx-auto max-w-5xl px-6 -mt-4 pb-16">
      <Reveal>
        <TiltStage>
          <AppShowcase />
        </TiltStage>
      </Reveal>
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
      <Reveal className="order-2 lg:order-1">
        <Parallax speed={4} className="ticks">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <div className="glass-strong rounded-2xl overflow-hidden"><TypingTerminal /></div>
        </Parallax>
      </Reveal>
      <div className="order-1 lg:order-2">
        <Reveal>
          <Kicker n="01">parallel by default</Kicker>
          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Don&apos;t pick a strategy. Run them all.
          </h2>
          <p className="mt-4 text-lg text-[--color-muted] max-w-xl leading-relaxed">
            Best engineers explore. Termi lets you explore at machine scale — spin up
            competing implementations at once, benchmark them against real tests, and
            keep only the one that wins.
          </p>
        </Reveal>
        <Reveal className="mt-8 grid gap-3">
          {["Fans one goal into many rival prototypes", "Benchmarks each against real tests, not vibes", "Promotes the winner, drops the rest"].map((t, i) => (
            <div key={t} className="glass rounded-xl p-4 flex items-center gap-3 card3d">
              <span className="font-mono text-sm text-[--color-coral]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] text-[--color-fg]">{t}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Console ---------------- */
function Console() {
  return (
    <section id="brain-activity" className="scroll-mt-20 mx-auto max-w-5xl px-6 py-20">
      <Reveal className="text-center">
        <div className="flex justify-center"><Kicker n="02">web console</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">Every experiment, live in the browser.</h2>
        <p className="mt-4 text-lg text-[--color-muted] max-w-xl mx-auto leading-relaxed">
          Watch each prototype build, see which strategy is winning, and redirect the
          brain mid-run — from your phone or laptop.
        </p>
      </Reveal>
      <Reveal className="mt-10 ticks">
        <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
        <div className="glass-strong rounded-2xl overflow-hidden"><ConsolePreview /></div>
      </Reveal>
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
      <Reveal>
        <div className="flex justify-center"><Kicker n="03">capabilities</Kicker></div>
        <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-center">Built for exploring at scale.</h2>
      </Reveal>
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


function Footer() {
  return (
    <footer className="border-t border-[--color-line]">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={26} />
        <div className="flex items-center gap-6 text-sm text-[--color-muted]">
          <a href="#features" className="hover:text-[--color-fg] transition">Capabilities</a>
          <a href="#faq" className="hover:text-[--color-fg] transition">FAQ</a>
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
        </div>
        <span className="font-mono text-xs text-[--color-faint]">© 2026 Termi</span>
      </div>
    </footer>
  );
}

const FEATURES = [
  { glyph: "⊞", title: "Parallel prototypes", body: "Turn one goal into many rival builds — running side by side, not one after another." },
  { glyph: "◇", title: "Strategy tournaments", body: "Pit approaches against each other, benchmark on real metrics, promote the winner." },
  { glyph: "✓", title: "Verified, not vibes", body: "Every branch is built, tested, and load-checked — ‘done’ means it actually passed." },
  { glyph: "◎", title: "AFK autopilot", body: "Set the goal, close the lid. The brain explores, decides, and reports back." },
  { glyph: "◉", title: "Web console", body: "Watch every experiment live and redirect the brain from any browser." },
  { glyph: "›_", title: "Native Mac terminal", body: "A real PTY with splits and tabs — bring Claude Code, Codex, or Gemini." },
];

