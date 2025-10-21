import { supabaseEnv } from "@/lib/supabase/env";
import type { OAuthProvider } from "@/lib/supabase/types";

export const OAUTH_PROVIDERS: OAuthProvider[] = ["apple", "google"];

export function getOAuthSignInUrl(provider: OAuthProvider, next = "/") {
  const searchParams = new URLSearchParams({ next });
  return `/api/auth/${provider}?${searchParams.toString()}`;
}

export function getOAuthErrorUrl(message?: string | null) {
  const searchParams = new URLSearchParams();
  if (message) searchParams.set("message", message);
  const query = searchParams.toString();
  return `${supabaseEnv.oauthErrorPath}${query ? `?${query}` : ""}`;
}
