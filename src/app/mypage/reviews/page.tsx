import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/actions";
import { fetchMyReviews } from "@/lib/data/my-reviews";
import { ReviewManager } from "@/app/mypage/components/review-manager";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "내 리뷰 관리 | seof",
  description: "작성한 리뷰를 수정하거나 삭제할 수 있는 관리 페이지입니다.",
};

export default async function MyReviewsPage() {
  const session = await requireSession();
  const reviews = await fetchMyReviews(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 md:py-16">
      <header className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="px-0 text-sm font-medium">
          <Link href="/mypage">← 내 정보로 돌아가기</Link>
        </Button>
        <p className="text-primary text-sm font-semibold uppercase tracking-wider">
          My Reviews
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          내가 작성한 리뷰 관리
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          기존에 작성한 리뷰를 확인하고, 필요한 경우 내용을 수정하거나 삭제하세요.
        </p>
      </header>

      <ReviewManager reviews={reviews} />
    </div>
  );
}
