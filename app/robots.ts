import type { MetadataRoute } from "next";
import { SITE_URL } from "./siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is per-user and behind auth — no value in crawling it.
      disallow: ["/dashboard", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
