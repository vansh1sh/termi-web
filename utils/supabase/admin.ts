import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isAdminConfigured = Boolean(supabaseUrl && supabaseSecret);

export function createAdminClient() {
  if (!supabaseUrl || !supabaseSecret) {
    throw new Error("Supabase admin client is not configured");
  }

  return createClient(supabaseUrl, supabaseSecret, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
