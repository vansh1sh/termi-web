import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termi — Web Connector",
  description: "Drive your Termi terminal from anywhere over Supabase Realtime.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, system-ui, sans-serif",
          background: "#0e0f12",
          color: "#e7e9ee",
        }}
      >
        {children}
      </body>
    </html>
  );
}
