"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ReviewListItem } from "@/lib/data/reviews";
import type { ReviewSortOption } from "@/lib/data/filters";
import { REVIEW_SORT_LABELS } from "@/lib/data/filters";
import type { RentType } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { ReviewFilters } from "@/app/reviews/components/review-filters";
import { ReviewList } from "@/app/reviews/components/review-list";

type ReviewFeedClientProps = {
  initialItems: ReviewListItem[];
  totalCount: number;
  sort: ReviewSortOption;
  rentType?: RentType;
  search?: string;
  pageSize: number;
  initialHasMore: boolean;
  initialNextOffset: number | null;
};

type ReviewsResponse = {
  items: ReviewListItem[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export function ReviewFeedClient({
  initialItems,
  totalCount,
  sort,
  rentType,
  search,
  pageSize,
  initialHasMore,
  initialNextOffset,
}: ReviewFeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [aggregateCount, setAggregateCount] = useState(totalCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | null>(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const summaryLabel = useMemo(() => {
    const parts: string[] = [`현재 정렬: ${REVIEW_SORT_LABELS[sort]}`];

    if (rentType) {
      parts.push(`임대방식 ${rentType}`);
    }

    if (search) {
      parts.push(`검색어 "${search}"`);
    }

    return parts.join(" · ");
  }, [sort, rentType, search]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || isLoading || nextOffset === null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("sort", sort);
      if (rentType) {
        params.set("rentType", rentType);
      }
      if (search) {
        params.set("q", search);
      }
      params.set("limit", String(pageSize));
      params.set("offset", String(nextOffset));

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "리뷰 데이터를 더 불러오지 못했습니다.";
        throw new Error(message);
      }

      const payload = (await response.json()) as ReviewsResponse;

      setItems((previous) => {
        const existingIds = new Set(previous.map((item) => item.id));
        const merged = [...previous];
        for (const item of payload.items) {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        }
        return merged;
      });

      setAggregateCount(payload.totalCount);
      setHasMore(payload.hasMore);
      setNextOffset(payload.hasMore ? payload.nextOffset : null);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 이유로 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, nextOffset, pageSize, rentType, search, sort]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        void fetchMore();
      }
    });

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [fetchMore]);

  return (
    <>
      <ReviewFilters
        totalCount={aggregateCount}
        defaultSort={sort}
        defaultRentType={rentType}
        defaultSearch={search}
      />

      <section aria-label="리뷰 목록" className="space-y-3">
        <p className="text-muted-foreground text-sm">{summaryLabel}</p>
        <ReviewList items={items} />

        <div aria-live="polite" className="flex flex-col items-center gap-3 pt-4">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>리뷰를 불러오는 중이에요...</span>
            </div>
          ) : null}

          {error ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-destructive text-sm">{error}</p>
              <Button type="button" size="sm" onClick={() => void fetchMore()}>
                다시 시도
              </Button>
            </div>
          ) : null}

          {!hasMore && items.length > 0 ? (
            <p className="text-muted-foreground text-xs">마지막 리뷰까지 모두 확인했어요.</p>
          ) : null}
        </div>

        <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
      </section>
    </>
  );
}
