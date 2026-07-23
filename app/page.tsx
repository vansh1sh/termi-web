import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[--color-ink]/70 border-b border-[--color-line]">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white text-sm">›_</span>
            Termi
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <Link href="/login" className="rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] text-white px-4 py-2 font-semibold transition">
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-[--color-coral]/20 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center px-6 pt-28 pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[--color-line] bg-[--color-panel] px-3 py-1 text-xs text-neutral-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live over Supabase Realtime
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Drive your terminal
            <br />
            <span className="bg-gradient-to-r from-[--color-coral] to-amber-300 bg-clip-text text-transparent">from anywhere.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
            Termi bridges your Mac terminal to the web. Sign in, run commands, watch live output,
            and steer your coding agents from any browser — securely, over your own private room.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/login" className="rounded-xl bg-[--color-coral] hover:bg-[--color-coral-600] text-white px-6 py-3 font-semibold transition shadow-lg shadow-[--color-coral]/25">
              Get started
            </Link>
            <a href="#how" className="rounded-xl border border-[--color-line] hover:border-neutral-500 px-6 py-3 font-semibold transition">
              How it works
            </a>
          </div>

          {/* Terminal mock */}
          <div className="mt-16 mx-auto max-w-2xl text-left rounded-2xl border border-[--color-line] bg-[--color-panel] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 h-9 border-b border-[--color-line]">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-neutral-500">termi — web console</span>
            </div>
            <pre className="p-4 text-[13px] leading-relaxed font-mono text-neutral-300">
{`› npm test
‹ ▶ ran in Termi: npm test
‹ message: 14 passed, 1 skipped (1.8s)
› git status
‹ message: On branch main — clean`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Everything, from the browser</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-[--color-line] bg-[--color-panel] p-6 hover:border-neutral-600 transition">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center">How it works</h2>
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto grid place-items-center w-10 h-10 rounded-full bg-[--color-coral] text-white font-bold">{i + 1}</div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-400">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/login" className="rounded-xl bg-[--color-coral] hover:bg-[--color-coral-600] text-white px-6 py-3 font-semibold transition">
            Sign in to connect
          </Link>
        </div>
      </section>

      <footer className="border-t border-[--color-line] py-8 text-center text-sm text-neutral-500">
        Termi · your terminal, everywhere.
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: "⚡", title: "Live commands", body: "Type in the browser, it runs in your real terminal — output streams straight back." },
  { icon: "🔒", title: "Private rooms", body: "Each account gets its own room. Only your signed-in devices can talk to your terminal." },
  { icon: "🌎", title: "From anywhere", body: "Phone, laptop, another network — the relay runs in the cloud, no port-forwarding." },
  { icon: "🤖", title: "Steer your agents", body: "Nudge Claude/Codex sessions running in Termi without being at your desk." },
  { icon: "📡", title: "Realtime", body: "Built on Supabase Realtime — low-latency, resilient, auto-reconnecting." },
  { icon: "🍎", title: "Native Mac app", body: "Termi is a real macOS terminal. The web is just another way in." },
];

const STEPS = [
  { title: "Open Termi", body: "Launch the Mac app and sign in to the Web Connector." },
  { title: "Sign in here", body: "Use the same account — you both land in one private room." },
  { title: "Run anything", body: "Type a command; it executes in your terminal and streams back." },
];
