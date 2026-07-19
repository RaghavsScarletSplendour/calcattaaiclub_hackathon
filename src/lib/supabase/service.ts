import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only storage operations (private bucket
// upload + signed URLs). Bypasses RLS — never import this from client code.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
