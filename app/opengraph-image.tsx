import { ImageResponse } from "next/og";

// Social-share card generated at build time (no external assets needed).
export const runtime = "nodejs";
export const alt = "Termi — Your terminal, now at 100X";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0b0e",
          backgroundImage: "radial-gradient(1000px circle at 20% -10%, #f07a5233, transparent 55%), radial-gradient(900px circle at 100% 120%, #f5b54422, transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "linear-gradient(135deg, #1a1d1a, #101210)",
              border: "1px solid #2f352e",
              boxShadow: "0 0 30px rgba(240,118,74,0.25)",
            }}
          >
            <svg
              width={46}
              height={46}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
              <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
              <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
              <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
              <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
              <path d="M6 18a4 4 0 0 1-1.967-.516" />
              <path d="M19.967 17.484A4 4 0 0 1 18 18" />
            </svg>
          </div>
          <div style={{ color: "#e7e9ee", fontSize: 46, fontWeight: 700 }}>Termi</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#e7e9ee", fontSize: 82, fontWeight: 800, lineHeight: 1.05 }}>
            Your terminal,
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              background: "linear-gradient(90deg, #f07a52, #f5b544)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            now at 100X.
          </div>
        </div>

        <div style={{ color: "#9aa0ad", fontSize: 30, marginTop: 40, maxWidth: 900 }}>
          A native Mac terminal with an AI brain that runs your work across many terminals — and you steer it from anywhere.
        </div>
      </div>
    ),
    { ...size },
  );
}
