"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isConfigured } from "@/utils/supabase/client";
import { BrainGlyph } from "../components/Logo";
import { isDemoCredentials, DEMO_FLAG } from "./demoAuth";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Surface an error passed back from the auth callback (expired link, denied, etc.).
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setError(err);
  }, []);

  const submit = async () => {
    if (busy) return;
    setError(null); setNotice(null);

    // Demo backdoor: demo / demo skips Supabase entirely and drops you straight
    // into the dashboard on the shared demo room. No network, no account.
    if (isDemoCredentials(email, password)) {
      try { sessionStorage.setItem(DEMO_FLAG, "1"); } catch { /* ignore */ }
      router.replace("/dashboard");
      return;
    }

    if (!isConfigured) { setError("Sign-in isn't configured on this deployment. Use demo / demo to explore."); return; }
    setBusy(true);
    try {
      const s = createClient();
      if (isSignup) {
        const { data, error } = await s.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setError(error.message); return; }
        if (data.session) router.replace("/dashboard");
        else setNotice("Account created. If email confirmation is on, check your inbox to verify, then sign in.");
      } else {
        const { error } = await s.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setError(error.message); else router.replace("/dashboard");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const isDemo = isDemoCredentials(email, password);
  const canSubmit = isDemo || (email.includes("@") && password.length >= 6);

  return (
    <div className="min-h-screen grid place-items-center px-6 relative overflow-hidden grain">
      <div className="blob1 pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[--color-coral]/15 blur-[120px]" />
      <div className="blob2 pointer-events-none absolute bottom-0 -right-32 h-[380px] w-[380px] rounded-full bg-[--color-amber]/10 blur-[120px]" />

      <div className="relative w-full max-w-sm reveal-scale in">
        {/* Brand */}
        <Link href="/" className="flex items-center justify-center gap-2.5 font-semibold text-lg mb-8">
          <span
            className="grid place-items-center w-9 h-9 rounded-[30%] relative"
            style={{
              background: "linear-gradient(135deg, #1a1d1a, #101210)",
              border: "1px solid var(--color-line-2)",
              boxShadow: "0 0 18px rgba(240,118,74,0.18)",
            }}
          >
            <BrainGlyph size={19} />
          </span>
          Termi<span className="text-[--color-coral]">.</span>
        </Link>

        <div className="glass-strong rounded-2xl p-7 shadow-2xl">
          <h1 className="text-xl font-semibold text-center tracking-tight">
            {isSignup ? "Create your account" : "Sign in to Termi"}
          </h1>
          <p className="mt-1.5 text-center text-xs text-[--color-muted]">
            The web console mirrors and steers Termi on your Mac.
          </p>

          <div className="mt-6 space-y-3">
            <input
              type="text" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address" autoComplete="email" autoCapitalize="none" spellCheck={false}
              className="w-full rounded-lg border border-[--color-line-2] bg-[--color-ink] px-4 py-3 text-sm outline-none focus:border-[--color-coral] transition"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
              placeholder="Password"
              aria-label="Password" autoComplete={isSignup ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-[--color-line-2] bg-[--color-ink] px-4 py-3 text-sm outline-none focus:border-[--color-coral] transition"
            />

            <button onClick={submit} disabled={busy || !canSubmit}
              className="w-full rounded-lg bg-[--color-coral] hover:bg-[--color-coral-600] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-semibold text-sm transition">
              {busy ? "…" : isDemo ? "Enter demo" : isSignup ? "Sign up" : "Sign in"}
            </button>

            <button onClick={() => { setIsSignup(!isSignup); setError(null); setNotice(null); }}
              className="w-full text-center text-sm text-[--color-muted] hover:text-[--color-fg] transition">
              {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>

            {notice && <div role="status" className="text-sm text-green-400 text-center">{notice}</div>}
            {error && <div role="alert" className="text-sm text-red-400 text-center">{error}</div>}
          </div>
        </div>

        {/* Demo hint */}
        <button
          onClick={() => { setEmail("demo"); setPassword("demo"); setError(null); setNotice(null); }}
          className="mt-4 w-full text-center text-xs text-[--color-faint] hover:text-[--color-muted] transition"
        >
          Just exploring? Use <span className="font-mono text-[--color-coral]">demo</span> / <span className="font-mono text-[--color-coral]">demo</span>
        </button>

        <p className="mt-4 text-center text-xs text-[--color-faint]">
          <Link href="/" className="hover:text-[--color-muted]">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
