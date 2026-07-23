import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Termi — Drive your terminal from anywhere",
  description:
    "Termi bridges your Mac terminal to the web. Sign in and run commands, watch output, and steer your agents from any browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[--color-ink] text-[#e7e9ee]">
        {children}
      </body>
    </html>
  );
}
