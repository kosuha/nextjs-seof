"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

type BrowserClient = SupabaseClient<Database>;

export const createSupabaseBrowserClient = (): BrowserClient =>
  createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);

export type { Session };
