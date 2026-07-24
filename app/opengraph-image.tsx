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
              background: "linear-gradient(135deg, #f07a52, #e5623a)",
              color: "#fff",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            ›_
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
