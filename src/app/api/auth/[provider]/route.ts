import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type { OAuthProvider } from "@/lib/supabase/types";

const supportedProviders: OAuthProvider[] = ["apple", "google"];

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider: rawProvider } = await context.params;
  const provider = rawProvider.toLowerCase();

  if (!supportedProviders.includes(provider as OAuthProvider)) {
    return NextResponse.json(
      { message: `Unsupported provider: ${provider}` },
      { status: 400 },
    );
  }

  const next = request.nextUrl.searchParams.get("next") ?? supabaseEnv.oauthSuccessPath;
  const redirectTo =
    request.nextUrl.searchParams.get("redirect_to") ??
    `${supabaseEnv.oauthRedirectUrl}?next=${encodeURIComponent(next)}`;

  const supabase = await createSupabaseRouteHandlerClient();
  const {
    data: { url },
    error,
  } = await supabase.auth.signInWithOAuth({
    provider: provider as OAuthProvider,
    options: {
      redirectTo,
      scopes: provider === "google" ? "email profile" : undefined,
    },
  });

  if (error || !url) {
    return NextResponse.redirect(
      new URL(supabaseEnv.oauthErrorPath, request.nextUrl.origin),
      { status: 302 },
    );
  }

  return NextResponse.redirect(url);
}
