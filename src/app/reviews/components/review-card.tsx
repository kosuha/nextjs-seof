"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, Layers, Home, Coins, Star, MapPin, Calendar, Building, HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReviewListItem } from "@/lib/data/reviews";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

type ReviewCardProps = {
  review: ReviewListItem;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const createdAtLabel = dateFormatter.format(new Date(review.created_at));

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="gap-2 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-foreground text-lg font-semibold">
            {review.room_name}
          </CardTitle>
          <span className="text-muted-foreground text-xs font-medium">
            {createdAtLabel}
          </span>
        </div>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="size-4" aria-hidden />
          <Link
            href={`https://map.naver.com/p/search/${encodeURIComponent(review.room_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            {review.room_address}
          </Link>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="text-muted-foreground grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <InfoItem
            icon={<Star className="size-4" aria-hidden />}
            label="평점"
            value={Number(review.score).toFixed(1)}
          />
          {review.move_at ? (
            <InfoItem
              icon={<Calendar className="size-4" aria-hidden />}
              label="입주 연도"
              value={formatMoveYear(review.move_at)}
            />
          ) : null}
          {review.floor ? (
            <InfoItem
              icon={<Building className="size-4" aria-hidden />}
              label="층수"
              value={`${review.floor}`}
            />
          ) : null}
          <InfoItem
            icon={<HandCoins className="size-4" aria-hidden />}
            label="임대 방식"
            value={`${review.rent_type}${
              review.annualRentLabel ? ` · ${review.annualRentLabel}` : ""
            }`}
          />
        </dl>

        {review.context ? (
          <p className="bg-muted/40 text-foreground whitespace-pre-line break-words rounded-lg p-4 text-sm leading-relaxed">
            {review.context}
          </p>
        ) : (
          <p className="border-muted-foreground/40 text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
            작성된 리뷰 내용이 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type InfoItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="border-border/60 bg-background/40 flex items-center gap-3 rounded-md border px-3 py-2">
      <span className="bg-accent/40 text-accent-foreground flex size-9 items-center justify-center rounded-md">
        {icon}
      </span>
      <div>
        <p className="text-muted-foreground/70 text-xs tracking-wide uppercase">
          {label}
        </p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}

function formatMoveYear(value: string) {
  const match = value.match(/\d{4}/);
  if (!match) {
    return value;
  }
  return `${match[0]}년`;
}
