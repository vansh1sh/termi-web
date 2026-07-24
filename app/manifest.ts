import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Termi — Your terminal, now at 100X",
    short_name: "Termi",
    description:
      "A native Mac terminal with an AI brain that runs your work across many terminals — and you steer it from anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0e",
    theme_color: "#0a0b0e",
    icons: [
      // The icon is a full-bleed coral tile, so it's safe as both any and maskable.
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "maskable" },
    ],
  };
}
