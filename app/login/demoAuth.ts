// The demo backdoor: a single fixed credential (demo / demo) that bypasses
// Supabase entirely so anyone can explore the dashboard without an account.
//
// It is deliberately an EXACT match on both fields — no prefixes, no casing
// tricks, no "starts with" — so it can never accidentally match a real login.
// Termi uses the same room (termi:demo), so a demo login on the web and a demo
// login in the Mac app share one live room and can drive each other.

export const DEMO_ROOM = "termi:demo";
export const DEMO_EMAIL = "demo";
export const DEMO_FLAG = "termi.demo"; // sessionStorage marker for a demo session

/** True only for the exact credential pair demo / demo. */
export function isDemoCredentials(email: string, password: string): boolean {
  return email.trim() === "demo" && password === "demo";
}
