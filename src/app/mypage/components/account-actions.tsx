import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MessageCircleQuestion, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountDeleteButton } from "@/app/mypage/components/account-delete-button";
import { signOut } from "@/lib/auth/actions";

type AccountActionsProps = {
  userEmail: string | null | undefined;
};

export function AccountActions({ userEmail }: AccountActionsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-semibold">문의하기</CardTitle>
          <CardDescription>
            서비스 이용 중 궁금한 점이나 문제가 있으면 아래 채널로 연락해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ContactRow
            icon={<Mail className="size-4" aria-hidden />}
            label="이메일"
            value="support@seof.app"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="mailto:support@seof.app?subject=seof%20문의">
                  <Mail className="size-4" />
                  메일 보내기
                </Link>
              </Button>
            }
          />
          <ContactRow
            icon={<MessageCircleQuestion className="size-4" aria-hidden />}
            label="커뮤니티"
            value="오픈채팅에서 다른 사용자들과 소통해 보세요."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="https://open.kakao.com/o/some-link" target="_blank" rel="noreferrer">
                  참여하기
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-semibold">계정 설정</CardTitle>
          <CardDescription>
            로그인 정보와 계정 보안을 관리하고 필요 시 탈퇴를 진행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-foreground text-sm font-semibold">로그인 이메일</p>
            <p className="text-muted-foreground text-sm">
              {userEmail ?? "연결된 이메일이 없습니다."}
            </p>
          </div>
          <form action={signOut} className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" variant="outline" size="sm" className="sm:w-auto">
              로그아웃
            </Button>
          </form>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-destructive">
                <ShieldAlert className="size-5" aria-hidden />
              </span>
              <div className="space-y-2">
                <p className="text-foreground text-sm font-semibold">회원 탈퇴</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  탈퇴 시 계정과 함께 작성한 리뷰 데이터가 모두 삭제되며 복구할 수 없습니다.
                </p>
                <AccountDeleteButton />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  action: ReactNode;
}) {
  return (
    <div className="border-border/60 bg-background/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div className="space-y-1">
          <p className="text-foreground text-sm font-semibold">{label}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{value}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
