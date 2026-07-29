import Link from "next/link";
import Reveal from "./components/Reveal";
import FAQ from "./components/FAQ";
import NavLinks from "./components/NavLinks";
import AmbientBackdrop from "./components/AmbientBackdrop";
import Hero from "./components/Hero";
import TabbedDemo from "./components/TabbedDemo";
import ConsolePreview from "./components/ConsolePreview";
import { Logo } from "./components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Living neural field + pointer glow — desktop only (see AmbientBackdrop). */}
      <AmbientBackdrop />

      <a href="#content" className="skip-link">Skip to content</a>
      <Nav />
      <main id="content">
        <Hero />
        <Demo />
        <Console />
        <How />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-6 h-16">
        <Link href="/" aria-label="Termi home">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-4 sm:gap-7 text-sm text-[--color-muted]">
          <NavLinks />
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
          {/* Primary CTA — always visible; a compact coral pill on phones, text+icon on sm+ */}
          <a
            href="/downloads/Termi.dmg"
            download="Termi.dmg"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-coral] px-3 py-1.5 font-medium text-white transition hover:bg-[--color-coral-600] sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-[--color-fg] sm:hover:bg-transparent sm:hover:text-[--color-coral]"
          >
            Download
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M7 10l5 5 5-5M4 21h16"/></svg>
          </a>
        </div>
      </nav>
    </header>
  );
}

/* ---------------- Demo: the real thing, fast-forwarded ---------------- */
function Demo() {
  return (
    <section id="demo" className="scroll-mt-20 py-14 sm:py-20">
      <Reveal>
        <div className="mx-auto max-w-5xl px-5 sm:px-6 text-center mb-8 sm:mb-10">
          <p className="kicker mb-3">// watch it work</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            One sentence in. A working app out.
          </h2>
          <p className="mt-3 text-[--color-muted] max-w-xl mx-auto text-sm sm:text-base">
            Watch the brain plan, drive four agents in parallel, and verify the result.
          </p>
        </div>
      </Reveal>
      <Reveal>
        <TabbedDemo />
      </Reveal>
    </section>
  );
}

/* ---------------- Console: watch + steer the brain from any browser ---------------- */
function Console() {
  return (
    <section id="brain-activity" className="scroll-mt-20 mx-auto max-w-5xl px-5 sm:px-6 py-14 sm:py-20">
      <Reveal className="text-center">
        <p className="kicker mb-3">// web console</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Every run, live in the browser.</h2>
        <p className="mt-4 text-[--color-muted] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Watch each terminal work, see what the brain is doing, and redirect it
          mid-run, from your phone or laptop.
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

/* ---------------- How: three lines, no slop ---------------- */
function How() {
  const steps = [
    { n: "01", title: "State the goal", body: "One sentence. The brain turns it into a plan, acceptance checks, and workstreams." },
    { n: "02", title: "Agents execute", body: "It runs Claude, Codex, or Gemini, routing each stream to the agent best at it, in parallel." },
    { n: "03", title: "The brain keeps the path", body: "Every pass it checks real output against the plan, corrects drift, and only accepts what actually works." },
  ];
  return (
    <section id="features" className="mx-auto max-w-5xl px-5 sm:px-6 py-14 sm:py-20">
      <Reveal>
        <div className="text-center mb-10">
          <p className="kicker mb-3">// how it works</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Three moves. Zero babysitting.</h2>
        </div>
      </Reveal>
      <Reveal variant="stagger" className="grid sm:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="glass card3d rounded-xl p-6">
            <div className="font-mono text-sm text-[--color-coral]">{s.n}</div>
            <h3 className="mt-3 font-semibold text-[16px] tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm text-[--color-muted] leading-relaxed">{s.body}</p>
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
          <a href="#demo" className="hover:text-[--color-fg] transition">Demo</a>
          <a href="#faq" className="hover:text-[--color-fg] transition">FAQ</a>
          <Link href="/login" className="hover:text-[--color-fg] transition">Sign in</Link>
        </div>
        <span className="font-mono text-xs text-[--color-faint]">© 2026 Termi</span>
      </div>
    </footer>
  );
}
