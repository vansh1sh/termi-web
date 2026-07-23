import Link from "next/link";
import Reveal from "./components/Reveal";
import TypingTerminal from "./components/TypingTerminal";
import DownloadButton from "./components/DownloadButton";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Background: aurora blobs + grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[--color-coral]/20 blur-[130px]" />
        <div className="blob2 absolute top-1/3 -right-40 h-[560px] w-[560px] rounded-full bg-[--color-amber]/15 blur-[130px]" />
        <div className="absolute inset-0 gridpulse [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <BigStat />
      <DownloadCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[--color-ink]/60 border-b border-white/5">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white shadow-lg shadow-[--color-coral]/30">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6"/><path d="M12 19h8"/></svg>
          </span>
          Termi
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-400">
          <a href="#features" className="hover:text-white transition hidden sm:block">Features</a>
          <a href="#how" className="hover:text-white transition hidden sm:block">How it works</a>
          <Link href="/login" className="hover:text-white transition">Sign in</Link>
          <DownloadButton />
        </div>
      </nav>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-neutral-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 caret" /> The terminal for 100X builders
          </div>
        </Reveal>
        <Reveal>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.02]">
            Your terminal,
            <br />
            <span className="shimmer">now at 100X.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            Termi is a native Mac terminal where an AI brain runs your work autonomously —
            verifying with real tests, across many terminals at once — and you can watch and
            steer it from any browser.
          </p>
        </Reveal>
        <Reveal>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <DownloadButton large />
            <a href="#how" className="rounded-2xl border border-white/10 hover:border-white/25 px-6 py-4 font-semibold transition">
              See how it works →
            </a>
          </div>
          <p className="mt-3 text-xs text-neutral-600">Free · macOS 14+ · Apple Silicon</p>
        </Reveal>
      </div>

      <Reveal variant="reveal-scale">
        <div className="relative">
          {/* orbit rings behind the terminal */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="spin-slow h-[420px] w-[420px] rounded-full border border-white/5" />
            <div className="spin-rev absolute h-[300px] w-[300px] rounded-full border border-white/5" />
          </div>
          <TypingTerminal />
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Marquee of agents ---------------- */
function Marquee() {
  const items = ["Claude Code", "Codex", "Gemini", "AFK Autopilot", "Multi-terminal", "Web Connector", "Cling", "iOS + Android", "Supabase Realtime"];
  const row = [...items, ...items];
  return (
    <div className="relative border-y border-white/5 py-5 overflow-hidden">
      <div className="marquee flex gap-10 w-max whitespace-nowrap text-sm text-neutral-500">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}<span className="text-[--color-coral]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <h2 className="text-4xl font-bold text-center tracking-tight">Everything a fast builder needs</h2>
        <p className="mt-3 text-center text-neutral-400 max-w-2xl mx-auto">One native app. A real terminal, an autonomous brain, and remote control.</p>
      </Reveal>
      <Reveal variant="stagger" className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="group relative rounded-2xl border border-white/8 bg-white/[0.02] p-6 hover:border-[--color-coral]/40 transition overflow-hidden">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[--color-coral]/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-400">{f.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal><h2 className="text-4xl font-bold text-center tracking-tight">Set a goal. Walk away.</h2></Reveal>
      <Reveal variant="stagger" className="mt-14 grid sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white font-bold shadow-lg shadow-[--color-coral]/30">{i + 1}</div>
            <h3 className="mt-4 font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-400">{s.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------------- Big stat ---------------- */
function BigStat() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-center">
      <Reveal variant="reveal-scale">
        <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent p-14">
          <div className="text-7xl font-bold shimmer">100X</div>
          <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
            Stop babysitting your terminal. Termi's brain plans, builds, and verifies —
            while you review from anywhere.
          </p>
          <div className="mt-8 flex justify-center"><DownloadButton large /></div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Download CTA ---------------- */
function DownloadCTA() {
  return (
    <section id="download" className="mx-auto max-w-4xl px-6 py-20">
      <Reveal variant="reveal-scale">
        <div className="relative rounded-3xl overflow-hidden border border-[--color-coral]/30 bg-[--color-panel] p-12 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-[560px] rounded-full bg-[--color-coral]/25 blur-[100px]" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight">Download Termi</h2>
            <p className="mt-3 text-neutral-400">Native macOS app. Free. Bring your own AI CLI.</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <DownloadButton large />
              <span className="text-xs text-neutral-600">Requires macOS 14+ · already have it? <Link href="/login" className="text-[--color-coral] hover:underline">Sign in to the web console →</Link></span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 text-center text-sm text-neutral-600">
      <div className="flex items-center justify-center gap-2 font-bold text-neutral-400 mb-2">
        <span className="grid place-items-center w-6 h-6 rounded-lg bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white text-xs">›_</span>
        Termi
      </div>
      Your terminal, everywhere. · Built for 100X builders.
    </footer>
  );
}

const FEATURES = [
  { icon: "🤖", title: "AFK Autopilot", body: "Set a goal and walk away. The brain drives your terminal and verifies with real tests before calling it done." },
  { icon: "⚡", title: "Multi-terminal", body: "Fan work across terminals — “terminal 1 does X, terminal 2 does Y” — orchestrated in parallel." },
  { icon: "🧪", title: "Verifies, not guesses", body: "Builds, runs the test suite, serves + curls web apps, boots the simulator — done means truly done." },
  { icon: "🌎", title: "Web Connector", body: "Sign in on the web and run commands, watch live output, and steer the brain from any browser." },
  { icon: "🍎", title: "Native Mac terminal", body: "A real PTY terminal with splits, tabs, and an Arc-style UI — not a wrapper." },
  { icon: "👁️", title: "Cling coach", body: "A floating coach that reads any app via accessibility and can click through steps for you." },
];

const STEPS = [
  { title: "Download & open", body: "Grab the Mac app, pick your AI CLI (Claude, Codex, Gemini)." },
  { title: "Set a goal", body: "Tell AFK mode what to build and for how long. Complex? Assign a task per terminal." },
  { title: "Watch from anywhere", body: "Sign in on the web to see live progress, test checks, and steer the brain." },
];
