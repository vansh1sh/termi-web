import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient, isConfigured } from "@/utils/supabase/server";
import { safeNext } from "@/app/auth/safeNext";

const loginWithError = (origin: string, msg: string) =>
  NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);

// Magic-link / OAuth lands here with a ?code=… — exchange it for a session cookie, then go on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  // Provider returned an error (denied, expired link, etc.) — bounce to login with a reason.
  const providerError = searchParams.get("error_description") || searchParams.get("error");
  if (providerError) return loginWithError(origin, providerError);

  if (!isConfigured) return loginWithError(origin, "Auth is not configured on this deployment.");
  if (!code) return loginWithError(origin, "Missing sign-in code");

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return loginWithError(origin, error.message);
  } catch {
    // Network failure / unexpected throw during exchange — never 500 the callback.
    return loginWithError(origin, "Could not complete sign-in. Please try again.");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
