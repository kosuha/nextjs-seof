import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? supabaseEnv.oauthSuccessPath;

  if (code) {
    const supabase = await createSupabaseRouteHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (errorDescription) {
    const errorUrl = new URL(supabaseEnv.oauthErrorPath, requestUrl.origin);
    errorUrl.searchParams.set("message", errorDescription);
    return NextResponse.redirect(errorUrl);
  }

  const nextUrl = new URL(next, requestUrl.origin);
  return NextResponse.redirect(nextUrl);
}
