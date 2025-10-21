import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types/supabase";

let serviceClient: SupabaseClient<Database, "public"> | null = null;

export function createSupabaseServiceRoleClient(): SupabaseClient<Database, "public"> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되어 있지 않습니다.");
  }

  if (!serviceClient) {
    serviceClient = createClient<Database, "public">(supabaseEnv.url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceClient;
}
