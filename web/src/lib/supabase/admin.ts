import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminConfigStatus() {
  const { url } = getSupabasePublicEnv();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  const missing = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !serviceKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter(Boolean) as string[];

  return {
    ok: missing.length === 0,
    missing,
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url } = getSupabasePublicEnv();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adminClient ??= createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
