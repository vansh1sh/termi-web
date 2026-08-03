import { type NextRequest } from "next/server";
import { refreshSession } from "@/utils/supabase/middleware";

// Refreshes the Supabase auth session on every request so Server Components see a
// valid user. (Next 16 renamed the "middleware" convention to "proxy".)
export async function proxy(request: NextRequest) {
  return refreshSession(request);
}

export const config = {
  // Skip auth work on static assets, metadata routes, and image files — they
  // never need a session and shouldn't touch auth cookies.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
