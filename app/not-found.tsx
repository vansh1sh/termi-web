import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 text-center relative overflow-hidden">
      <div className="blob1 pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[--color-coral]/15 blur-[120px]" />
      <div className="relative">
        <div className="text-7xl font-bold shimmer">404</div>
        <p className="mt-4 text-neutral-400">This route never got a blueprint.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
