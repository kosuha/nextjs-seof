"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteReview } from "@/app/mypage/actions";
import type { MyReviewListItem } from "@/lib/data/my-reviews";

type ReviewManagerProps = {
  reviews: MyReviewListItem[];
};

type Feedback = {
  type: "success" | "error";
  text: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function ReviewManager({ reviews }: ReviewManagerProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleFeedback = (next: Feedback | null) => {
    setFeedback(next);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-foreground text-xl font-semibold">내 리뷰 관리</h2>
          <p className="text-muted-foreground text-sm">
            작성한 리뷰를 확인하고 수정하거나 삭제할 수 있습니다.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/reviews">전체 리뷰 보기</Link>
        </Button>
      </header>

      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewItem({
  review,
  onFeedback,
}: {
  review: MyReviewListItem;
  onFeedback: (feedback: Feedback | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm("선택한 리뷰를 삭제하시겠습니까?")) {
      return;
    }
    onFeedback(null);
    startTransition(() => {
      deleteReview({ id: review.id }).then((result) => {
        if (result.ok) {
          onFeedback({ type: "success", text: "리뷰를 삭제했습니다." });
          router.refresh();
        } else {
          onFeedback({ type: "error", text: result.message });
        }
      });
    });
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            {review.roomName ?? `방 ID ${review.roomId}`}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden />
              {dateFormatter.format(new Date(review.createdAt))}
            </span>
            {review.roomAddress ? (
              <>
                <span aria-hidden>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden />
                  {review.roomAddress}
                </span>
              </>
            ) : null}
            {review.editedAt ? (
              <>
                <span aria-hidden>•</span>
                <span className="text-muted-foreground">
                  최근 수정 {dateFormatter.format(new Date(review.editedAt))}
                </span>
              </>
            ) : null}
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/reviews/${review.id}/edit`}>
              <Pencil className="size-4" />
              수정
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive bg-white text-destructive hover:bg-destructive/10 dark:bg-white"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-4" />
            삭제
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReviewSnapshot review={review} />
      </CardContent>
    </Card>
  );
}

function ReviewSnapshot({ review }: { review: MyReviewListItem }) {
  return (
    <dl className="grid gap-3 text-sm md:grid-cols-3">
      <SnapshotItem label="평점" value={`${Number(review.score).toFixed(1)}점`} />
      <SnapshotItem
        label="임대 정보"
        value={`${review.rentType}${review.annualRentLabel ? ` · ${review.annualRentLabel}` : ""}`}
      />
      <SnapshotItem label="입주 연도" value={review.moveAt || "-"} />
      <SnapshotItem label="층수" value={review.floor ?? "-"} />
      <SnapshotItem label="보증금" value={formatCurrency(review.deposit)} />
      <SnapshotItem label="월세" value={formatCurrency(review.rent)} />
    </dl>
  );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 bg-background/40 flex flex-col rounded-lg border p-4">
      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-foreground mt-1 font-medium">{value}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border/60 bg-muted/40 flex flex-col items-center justify-center gap-3 rounded-xl border p-10 text-center">
      <p className="text-foreground text-base font-medium">작성한 리뷰가 없습니다.</p>
      <p className="text-muted-foreground text-sm">
        첫 리뷰를 작성하고 다른 자취생들과 경험을 공유해 보세요.
      </p>
      <Button asChild size="sm">
        <Link href="/buildings">건물 찾으러 가기</Link>
      </Button>
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (value === null || typeof value === "undefined") return "-";
  const formatter = new Intl.NumberFormat("ko-KR");
  return `${formatter.format(value)}만원`;
}
