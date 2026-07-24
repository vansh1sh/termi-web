import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True only when both public env vars are present. */
export const isConfigured = Boolean(supabaseUrl && supabaseKey);

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
