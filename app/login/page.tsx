"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "password" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = () => createClient();

  const sendMagic = async () => {
    setError(null); setBusy(true);
    const { error } = await supabase().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setError(error.message); else setSent(true);
  };

  const submitPassword = async () => {
    setError(null); setNotice(null); setBusy(true);
    const s = supabase();
    if (isSignup) {
      const { data, error } = await s.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setBusy(false);
      if (error) { setError(error.message); return; }
      // If email confirmation is required, there's no session yet.
      if (data.session) router.replace("/dashboard");
      else setNotice("Account created. If email confirmation is on, check your inbox to verify, then sign in.");
    } else {
      const { error } = await s.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) setError(error.message); else router.replace("/dashboard");
    }
  };

  const canPassword = email.includes("@") && password.length >= 6;

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
              <p className="mt-2 text-sm text-neutral-400">Magic link sent to <b className="text-neutral-200">{email}</b>.</p>
              <button onClick={() => setSent(false)} className="mt-5 text-sm text-[--color-coral] hover:underline">Back</button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-center">
                {mode === "magic" ? "Sign in with a link" : isSignup ? "Create your account" : "Sign in to Termi"}
              </h1>

              {/* Mode switch */}
              <div className="mt-5 flex rounded-lg border border-[--color-line] p-1 text-sm">
                <button onClick={() => setMode("password")} className={`flex-1 rounded-md py-1.5 font-medium transition ${mode === "password" ? "bg-[--color-coral] text-white" : "text-neutral-400"}`}>Password</button>
                <button onClick={() => setMode("magic")} className={`flex-1 rounded-md py-1.5 font-medium transition ${mode === "magic" ? "bg-[--color-coral] text-white" : "text-neutral-400"}`}>Magic link</button>
              </div>

              <div className="mt-5 space-y-3">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[--color-line] bg-[--color-ink] px-4 py-3 outline-none focus:border-[--color-coral] transition"
                />
                {mode === "password" && (
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canPassword && submitPassword()}
                    placeholder="Password (min 6 chars)"
                    className="w-full rounded-lg border border-[--color-line] bg-[--color-ink] px-4 py-3 outline-none focus:border-[--color-coral] transition"
                  />
                )}

                {mode === "password" ? (
                  <button onClick={submitPassword} disabled={busy || !canPassword}
                    className="w-full rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-50 text-white py-3 font-semibold transition">
                    {busy ? "…" : isSignup ? "Sign up" : "Sign in"}
                  </button>
                ) : (
                  <button onClick={sendMagic} disabled={busy || !email.includes("@")}
                    className="w-full rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-50 text-white py-3 font-semibold transition">
                    {busy ? "Sending…" : "Send magic link"}
                  </button>
                )}

                {mode === "password" && (
                  <button onClick={() => { setIsSignup(!isSignup); setError(null); setNotice(null); }} className="w-full text-center text-sm text-neutral-400 hover:text-white transition">
                    {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
                  </button>
                )}

                {notice && <div className="text-sm text-green-400 text-center">{notice}</div>}
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
