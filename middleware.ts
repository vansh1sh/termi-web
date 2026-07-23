import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Refreshes the Supabase auth session on every request so Server Components see a valid user.
export async function middleware(request: NextRequest) {
  return createClient(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
