"use client";

import { useState } from "react";
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
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ fontSize: 22 }}>Sign in to Termi</h1>
      <p style={{ color: "#9aa0aa", fontSize: 13 }}>
        A magic link connects this browser to your terminal — no password.
      </p>

      {sent ? (
        <div style={{ marginTop: 24, padding: 16, background: "#16181d", borderRadius: 10 }}>
          ✉️ Check <b>{email}</b> for a login link, then come back here.
        </div>
      ) : (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendLink()}
            placeholder="you@example.com"
            style={{
              padding: "12px 14px", borderRadius: 8, border: "1px solid #2a2d34",
              background: "#0e0f12", color: "#e7e9ee", fontSize: 14,
            }}
          />
          <button
            onClick={sendLink}
            disabled={busy || !email.includes("@")}
            style={{
              padding: "12px", borderRadius: 8, border: "none", background: "#f07a52",
              color: "#fff", fontWeight: 600, opacity: busy || !email.includes("@") ? 0.5 : 1,
            }}
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
          {error && <div style={{ color: "#f85149", fontSize: 12 }}>{error}</div>}
        </div>
      )}
    </main>
  );
}
