"use client";

// Catches errors thrown in the root layout itself. Must render <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0b0e", color: "#e7e9ee", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "grid", placeItems: "center", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#f07a52" }}>Something went wrong</h1>
          <p style={{ color: "#9aa0ad", marginTop: 12 }}>The app failed to start. Please reload.</p>
          <button
            onClick={reset}
            style={{ marginTop: 28, background: "#f07a52", color: "#fff", border: 0, borderRadius: 14, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
