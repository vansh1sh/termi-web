import Link from "next/link";
import Reveal from "./components/Reveal";
import FAQ from "./components/FAQ";
import NavLinks from "./components/NavLinks";
import NeuralNet from "./components/NeuralNet";
import CursorGlow from "./components/CursorGlow";
import Hero from "./components/Hero";
import TabbedDemo from "./components/TabbedDemo";
import { Logo } from "./components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Living neural field + pointer glow behind everything. */}
      <NeuralNet />
      <CursorGlow />

      <a href="#content" className="skip-link">Skip to content</a>
      <Nav />
      <main id="content">
        <Hero />
        <Demo />
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

/* ---------------- Demo: the real thing, fast-forwarded ---------------- */
function Demo() {
  return (
    <section id="demo" className="py-16">
      <Reveal>
        <TabbedDemo />
      </Reveal>
    </section>
  );
}

/* ---------------- How: three lines, no slop ---------------- */
function How() {
  const steps = [
    { n: "01", title: "State the goal", body: "One sentence. The brain turns it into a plan, acceptance checks, and workstreams." },
    { n: "02", title: "Agents execute", body: "It runs Claude, Codex, or Gemini — routing each stream to the agent best at it, in parallel." },
    { n: "03", title: "The brain keeps the path", body: "Every pass it checks real output against the plan, corrects drift, and only accepts what actually works." },
  ];
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-16">
      <Reveal className="grid sm:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="glass rounded-xl p-6">
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
