import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL_OBJECT } from "./siteUrl";
import { jsonLd } from "./jsonLd";
import "./globals.css";

// UI/display sans + a real terminal mono. Exposed as CSS vars so Tailwind's
// font-sans / font-mono resolve to them (see globals.css @theme).
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-src", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-src", display: "swap" });

const title = "Termi — Your terminal, now at 100X";
const description =
  "A native Mac terminal where an AI brain runs your work autonomously — verifying with real tests, across many terminals at once — and you can watch and steer it from any browser.";

export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: { default: title, template: "%s · Termi" },
  description,
  keywords: ["terminal", "AI terminal", "Claude Code", "autonomous agent", "macOS", "AFK mode", "developer tools"],
  authors: [{ name: "Termi" }],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Termi",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Termi",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  colorScheme: "dark",
};

// Site-wide structured data: identifies Termi as a free macOS app so search
// engines can render rich app results (name, OS, price, logo).
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Termi",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS 14+",
  description,
  url: SITE_URL_OBJECT.href,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased min-h-screen bg-[--color-ink] text-[#e7e9ee] font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(appJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
