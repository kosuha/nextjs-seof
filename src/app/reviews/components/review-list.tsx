"use client";

import { ReviewCard } from "@/app/reviews/components/review-card";
import type { ReviewListItem } from "@/lib/data/reviews";

type ReviewListProps = {
  items: ReviewListItem[];
};

export function ReviewList({ items }: ReviewListProps) {
  if (items.length === 0) {
    return (
      <div className="border-border bg-card/40 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <p className="text-foreground text-lg font-semibold">리뷰가 아직 없어요.</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          검색 조건을 변경하거나 다른 건물명을 입력해서 다시 시도해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
