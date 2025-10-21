import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/actions";
import { fetchMyReviewCount } from "@/lib/data/my-reviews";
import { fetchUserProfile } from "@/lib/data/user-profile";
import { ProfileSummary } from "@/app/mypage/components/profile-summary";
import { AccountActions } from "@/app/mypage/components/account-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "마이페이지 | seof",
  description: "내 계정과 작성한 리뷰를 관리할 수 있는 마이페이지입니다.",
};

export default async function MyPage() {
  const session = await requireSession();

  const [profile, reviewCount] = await Promise.all([
    fetchUserProfile(session.user.id),
    fetchMyReviewCount(session.user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 md:py-16">
      <ProfileSummary user={session.user} profile={profile} reviewCount={reviewCount} />
      <ManageReviewsCard reviewCount={reviewCount} />
      <AccountActions userEmail={session.user.email} />
    </div>
  );
}

function ManageReviewsCard({ reviewCount }: { reviewCount: number }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-foreground text-xl font-semibold">내 리뷰 관리</CardTitle>
        <CardDescription>
          작성한 리뷰를 수정·삭제하거나 최신 내용을 검토하려면 아래 버튼을 눌러 관리 페이지로 이동하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            현재 작성한 리뷰 수는 <span className="text-foreground font-semibold">{reviewCount}</span>
            개입니다.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/mypage/reviews">리뷰 관리 페이지로 이동</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
