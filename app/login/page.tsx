"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendLink = async () => {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[--color-coral]/15 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-lg mb-8">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white">›_</span>
          Termi
        </Link>

        <div className="rounded-2xl border border-[--color-line] bg-[--color-panel] p-7 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="text-3xl mb-3">✉️</div>
              <h1 className="text-xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-neutral-400">
                We sent a magic link to <b className="text-neutral-200">{email}</b>. Click it to sign in — it opens the dashboard here (and can sign in the Termi app too).
              </p>
              <button onClick={() => setSent(false)} className="mt-5 text-sm text-[--color-coral] hover:underline">Use a different email</button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-center">Sign in to Termi</h1>
              <p className="mt-2 text-sm text-neutral-400 text-center">A magic link — no password.</p>
              <div className="mt-6 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email.includes("@") && sendLink()}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[--color-line] bg-[--color-ink] px-4 py-3 outline-none focus:border-[--color-coral] transition"
                />
                <button
                  onClick={sendLink}
                  disabled={busy || !email.includes("@")}
                  className="w-full rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-50 text-white py-3 font-semibold transition"
                >
                  {busy ? "Sending…" : "Send magic link"}
                </button>
                {error && <div className="text-sm text-red-400 text-center">{error}</div>}
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          <Link href="/" className="hover:text-neutral-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
