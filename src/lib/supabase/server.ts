import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

type ServerClient = SupabaseClient<Database, "public">;

const buildCookieAdapter = (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  mutable: boolean,
) => ({
  get(name: string) {
    return cookieStore.get(name)?.value;
  },
  set(name: string, value: string, options: CookieOptions) {
    if (!mutable) return;
    cookieStore.set({ name, value, ...options });
  },
  remove(name: string, _options?: CookieOptions) {
    void _options;
    if (!mutable) return;
    cookieStore.delete(name);
  },
});

export const createSupabaseServerComponentClient = async (): Promise<ServerClient> => {
  const cookieStore = await cookies();
  return createServerClient<Database, "public">(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: buildCookieAdapter(cookieStore, false),
  });
};

export const createSupabaseRouteHandlerClient = async (): Promise<ServerClient> => {
  const cookieStore = await cookies();
  return createServerClient<Database, "public">(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: buildCookieAdapter(cookieStore, true),
  });
};

export const getServerSession = async (): Promise<Session | null> => {
  const supabase = await createSupabaseServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
