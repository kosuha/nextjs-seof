import Link from "next/link";
import type { Metadata } from "next";
import { Apple, Chrome, LogInIcon } from "lucide-react";
import { authBypassIfLoggedIn } from "@/lib/auth/actions";
import { getOAuthSignInUrl, OAUTH_PROVIDERS } from "@/lib/auth/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "로그인 | seof",
  description: "Supabase 계정으로 로그인하고 seof의 모든 기능을 사용해 보세요.",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  await authBypassIfLoggedIn();

  const resolvedSearchParams = (await searchParams) ?? undefined;

  const nextParam = extractSingleValue(resolvedSearchParams?.next);
  const errorMessage = extractSingleValue(resolvedSearchParams?.error);
  const oAuthProviders = OAUTH_PROVIDERS;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">로그인</h1>
        <p className="text-muted-foreground text-sm">
          seof 계정으로 로그인하고 자취방 리뷰를 쉽게 관리하세요.
        </p>
      </div>

      {errorMessage ? (
        <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-foreground text-xl font-semibold">
            간편 로그인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Apple 또는 Google 계정으로 로그인하고 seof의 리뷰 서비스를 이용해 보세요.
          </p>
          <div className="space-y-3">
            {oAuthProviders.map((provider) => (
              <OauthButton key={provider} provider={provider} redirectTo={nextParam} />
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs text-center leading-relaxed">
        아직 계정이 없다면{" "}
        <Link href="/signup" className="text-primary hover:underline">
          회원가입
        </Link>
        을 진행해 주세요.
      </p>
    </div>
  );
}

function OauthButton({
  provider,
  redirectTo,
}: {
  provider: (typeof OAUTH_PROVIDERS)[number];
  redirectTo?: string;
}) {
  const label = providerLabel(provider);
  const href = getOAuthSignInUrl(provider, redirectTo ?? "/");

  return (
    <Button
      asChild
      variant="outline"
      className="w-full justify-start gap-3"
    >
      <Link href={href}>
        {providerIcon(provider)}
        {label}
      </Link>
    </Button>
  );
}

function providerLabel(provider: (typeof OAUTH_PROVIDERS)[number]) {
  switch (provider) {
    case "apple":
      return "Apple로 계속하기";
    case "google":
      return "Google로 계속하기";
    default:
      return `${provider} 로그인`;
  }
}

function providerIcon(provider: (typeof OAUTH_PROVIDERS)[number]) {
  switch (provider) {
    case "apple":
      return <Apple className="size-4" aria-hidden />;
    case "google":
      return <Chrome className="size-4" aria-hidden />;
    default:
      return <LogInIcon className="size-4" aria-hidden />;
  }
}

function extractSingleValue(input: string | string[] | undefined) {
  if (!input) return undefined;
  if (Array.isArray(input)) {
    return input[0];
  }
  return input;
}
