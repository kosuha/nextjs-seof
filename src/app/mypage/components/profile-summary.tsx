import type { Session } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserProfile } from "@/lib/data/user-profile";

type SupabaseUser = Session["user"];

type ProfileSummaryProps = {
  user: SupabaseUser;
  profile: UserProfile | null;
  reviewCount: number;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function ProfileSummary({ user, profile, reviewCount }: ProfileSummaryProps) {
  const joinedAt = user.created_at ? dateFormatter.format(new Date(user.created_at)) : "-";
  const provider = profile?.social_login ?? user.app_metadata?.provider ?? "알 수 없음";
  const email = user.email ?? "등록된 이메일이 없습니다.";

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-foreground text-2xl font-semibold">안녕하세요 👋</CardTitle>
        <CardDescription>
          계정 정보와 리뷰 활동 현황을 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 text-sm md:grid-cols-2">
          <InfoRow label="이메일" value={email} />
          <InfoRow label="가입일" value={joinedAt} />
          <InfoRow label="로그인 방식" value={providerLabel(provider)} />
          <InfoRow label="작성한 리뷰 수" value={`${reviewCount}개`} />
        </dl>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 bg-background/60 flex min-w-0 flex-col rounded-lg border p-4">
      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-foreground mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function providerLabel(raw: string) {
  if (raw === "apple") return "Apple";
  if (raw === "google") return "Google";
  if (raw === "email") return "Email";
  return raw;
}
