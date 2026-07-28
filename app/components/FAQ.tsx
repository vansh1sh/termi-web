import Reveal from "./Reveal";
import { jsonLd } from "../jsonLd";

const QA = [
  { q: "Is Termi free?", a: "Yes. The Mac app is free to download and use. You bring your own AI CLI (Claude Code, Codex, Gemini) and your own model credits." },
  { q: "Does it run my code anywhere but my Mac?", a: "No. Every terminal and the brain run locally on your machine. The web console only mirrors status and relays the instructions you send. Nothing executes in the cloud." },
  { q: "What can the brain actually do on its own?", a: "It plans a goal into steps, drives one or many terminals, and verifies with real checks (building, running your test suite, curling a dev server, or booting a simulator) before it calls the work done." },
  { q: "Can I take over mid-run?", a: "Anytime. Start typing in any terminal and the brain preemptively pauses that one until you're finished, then resumes from where you left it." },
  { q: "What do I need to get started?", a: "A Mac and an AI CLI you already use (Claude Code, Codex, or Gemini). Sign in once to enable the web console for remote monitoring." },
];

// Structured data so search engines can surface the Q&A as rich results.
// Derived from the same QA array, so it can never drift from what's shown.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: QA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-5 sm:px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />
      <Reveal>
        <h2 className="text-3xl sm:text-4xl font-semibold text-center tracking-tight">Questions</h2>
      </Reveal>
      <Reveal variant="stagger" className="mt-12 space-y-3">
        {QA.map((item) => (
          <details key={item.q} className="faq group rounded-2xl border border-white/8 bg-white/[0.02] px-6 open:border-[--color-coral]/30 transition-colors">
            <summary className="flex items-center justify-between py-5 font-semibold">
              {item.q}
              <span className="chev text-[--color-coral]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </summary>
            <div className="ans">
              <p className="pb-5 text-neutral-400">{item.a}</p>
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
