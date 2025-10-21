import Link from "next/link";
import { ArrowRight, Star, CalendarDays, MapPin } from "lucide-react";
import { ContainerShell } from "@/app/components/container-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchReviews } from "@/lib/data/reviews";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const MAX_PREVIEW_LENGTH = 140;

export async function RecentReviewsSection() {
  const { items } = await fetchReviews({ limit: 4, sort: "latest" });

  return (
    <ContainerShell
      as="section"
      aria-labelledby="recent-reviews-heading"
      className="flex flex-col gap-8 py-8"
    >
      <div className="flex flex-col gap-3 text-left">
        <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
          Latest Reviews
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="recent-reviews-heading"
            className="text-foreground text-2xl font-semibold leading-tight sm:text-3xl"
          >
            방금 등록된 리뷰를 살펴보세요
          </h2>
          <Link href="/reviews" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              전체 리뷰 보기
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          실제 세입자들이 남긴 최신 후기를 모아 보여드려요. 더 많은 리뷰는 리뷰 페이지에서
          확인할 수 있습니다.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((review) => (
            <Link
              key={review.id}
              href={`/reviews?q=${encodeURIComponent(review.room_name)}`}
              className="group h-full"
            >
              <Card className="border-border/70 bg-card/80 flex h-full flex-col justify-between rounded-2xl border shadow-sm transition-colors group-hover:border-primary/60">
                <CardHeader className="gap-3 space-y-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-foreground text-lg font-semibold">
                      {review.room_name}
                    </CardTitle>
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    {Number(review.score).toFixed(1)}
                  </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{review.room_address}</span>
                </p>
                <p className="text-muted-foreground/80 flex items-center gap-2 text-xs uppercase tracking-[0.24em]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {dateFormatter.format(new Date(review.created_at))}
                </p>
              </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {formatExcerpt(review.context)}
                  </p>
                  <div className="text-muted-foreground/80 flex items-center justify-between text-xs uppercase tracking-[0.24em]">
                    <span>{review.rent_type}</span>
                    {review.annualRentLabel ? <span>{review.annualRentLabel}</span> : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Link href="/reviews" className="sm:hidden">
        <Button variant="outline" size="sm" className="w-full">
          전체 리뷰 보기
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </ContainerShell>
  );
}

function EmptyState() {
  return (
    <div className="border-border/60 bg-muted/30 flex flex-col items-center gap-4 rounded-2xl border px-8 py-12 text-center">
      <p className="text-foreground text-base font-semibold">아직 등록된 리뷰가 없어요.</p>
      <p className="text-muted-foreground text-sm">
        첫 번째 리뷰를 남기고 싶다면 로그인 후 리뷰 페이지에서 후기를 작성해 주세요.
      </p>
      <Link href="/reviews">
        <Button size="sm">
          리뷰 페이지로 이동
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </div>
  );
}

function formatExcerpt(value: string | null) {
  if (!value) {
    return "작성된 리뷰 내용이 없습니다.";
  }

  if (value.length <= MAX_PREVIEW_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_PREVIEW_LENGTH)}…`;
}
