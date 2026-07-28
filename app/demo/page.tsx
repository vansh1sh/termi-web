import Link from "next/link";
import TabbedDemo from "../components/TabbedDemo";
import { Logo } from "../components/Logo";

export const metadata = {
  title: "Demo · Termi",
  description: "Watch the AI brain build a 3D coffee app from one sentence, then explore the finished result.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-fg]">
      <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link href="/" aria-label="Termi home">
            <Logo size={28} />
          </Link>
          <Link href="/" className="text-sm text-[--color-muted] hover:text-[--color-fg] transition">
            &larr; Back to home
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-12 space-y-12 sm:space-y-16">
        {/* The build process */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Demo</h1>
          <p className="text-[--color-muted] max-w-2xl mb-8">
            One sentence in: &ldquo;Build a 3D coffee app with cart and checkout.&rdquo; The brain
            asks what it needs, plans the work, routes Claude, Codex &amp; Opus to their lanes,
            and drives all four terminals to a working build. Everything below is real and uncut.
          </p>

          <TabbedDemo />
        </section>

        {/* Source code */}
        <section>
          <h2 className="text-lg font-semibold mb-3">The code</h2>
          <p className="text-sm text-[--color-muted] max-w-xl mb-4">
            The full source the agents produced: a Vite + React + Three.js app with a Zustand
            cart store and mock checkout. Every file was written by the agents; the brain only
            supervised.
          </p>
          <div className="glass rounded-xl p-6 font-mono text-xs leading-relaxed text-[--color-muted] overflow-x-auto">
            <pre>{`coffee-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── content.json          ← Codex wrote this (menu data)
│   ├── scene/
│   │   └── CoffeeScene.jsx   ← Three.js WebGL scroll animation
│   ├── components/
│   │   ├── Menu.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   └── Checkout.jsx
│   ├── state/
│   │   └── cart.js            ← Zustand store (Opus wrote this)
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── MenuPage.jsx
│   │   └── CheckoutPage.jsx
│   └── data/
│       └── menu.json
└── public/`}</pre>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <p className="text-[--color-muted] text-sm mb-4">One goal. The brain handles the rest.</p>
          <a
            href="/downloads/Termi.dmg"
            download="Termi.dmg"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[--color-coral] text-white font-medium text-sm hover:opacity-90 transition"
          >
            Download Termi
          </a>
        </section>
      </main>
    </div>
  );
}
