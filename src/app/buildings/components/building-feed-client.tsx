"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildingFilters } from "@/app/buildings/components/building-filters";
import type { BuildingListItem } from "@/lib/data/buildings";
import type { BuildingSortOption } from "@/lib/data/filters";
import { BUILDING_SORT_LABELS } from "@/lib/data/filters";
import { formatAnnualRent } from "@/lib/utils/formatters";

type BuildingFeedClientProps = {
  initialItems: BuildingListItem[];
  totalCount: number;
  sort: BuildingSortOption;
  search?: string;
  pageSize: number;
  initialHasMore: boolean;
  initialNextOffset: number | null;
};

type BuildingsResponse = {
  items: BuildingListItem[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export function BuildingFeedClient({
  initialItems,
  totalCount,
  sort,
  search,
  pageSize,
  initialHasMore,
  initialNextOffset,
}: BuildingFeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [aggregateCount, setAggregateCount] = useState(totalCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | null>(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const summaryLabel = useMemo(() => {
    const parts: string[] = [`현재 정렬: ${BUILDING_SORT_LABELS[sort]}`];
    if (search) {
      parts.push(`검색어 "${search}"`);
    }
    return parts.join(" · ");
  }, [sort, search]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || isLoading || nextOffset === null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("sort", sort);
      if (search) {
        params.set("q", search);
      }
      params.set("limit", String(pageSize));
      params.set("offset", String(nextOffset));

      const response = await fetch(`/api/buildings?${params.toString()}`, {
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
            : "건물 데이터를 더 불러오지 못했습니다.";
        throw new Error(message);
      }

      const payload = (await response.json()) as BuildingsResponse;

      setItems((previous) => {
        const existingIds = new Set(previous.map((item) => item.room_id));
        const merged = [...previous];
        for (const item of payload.items) {
          if (!existingIds.has(item.room_id)) {
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
  }, [hasMore, isLoading, nextOffset, pageSize, search, sort]);

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
      <BuildingFilters totalCount={aggregateCount} defaultSort={sort} defaultSearch={search} />

      <section aria-label="건물 목록" className="flex flex-col gap-6">
        <p className="text-muted-foreground text-sm">{summaryLabel}</p>

        <div className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-foreground text-xl font-semibold">건물 목록</h2>
            <p className="text-muted-foreground text-sm">
              총 {aggregateCount.toLocaleString("ko-KR")}건의 데이터를 기준으로 정렬 중입니다.
            </p>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border/60 sm:block">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead className="bg-muted/60">
                  <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                    <th scope="col" className="px-4 py-3 text-left align-middle font-semibold">
                      건물 정보
                    </th>
                    <SortHeader label="평점" align="right" sortKey="rating" currentSort={sort} search={search} />
                    <SortHeader
                      label="리뷰 수"
                      align="right"
                      sortKey="review_count"
                      currentSort={sort}
                      search={search}
                    />
                    <SortHeader
                      label="연 임대료 평균"
                      align="right"
                      sortKey="rent"
                      currentSort={sort}
                      search={search}
                    />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground bg-muted/30 px-4 py-10 text-center text-sm"
                      >
                        조건에 맞는 건물 결과가 없습니다. 다른 검색어를 입력해 보세요.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => <BuildingRow key={item.room_id} building={item} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <MobileBuildingList items={items} hasData={items.length > 0} />

          <div aria-live="polite" className="flex flex-col items-center gap-3 pt-4">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span>건물 정보를 불러오는 중이에요...</span>
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
              <p className="text-muted-foreground text-xs">마지막 건물까지 모두 확인했어요.</p>
            ) : null}
          </div>
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
        </div>
      </section>
    </>
  );
}

type SortKey = "rating" | "review_count" | "rent";

function SortHeader({
  label,
  align,
  sortKey,
  currentSort,
  search,
}: {
  label: string;
  align: "left" | "right";
  sortKey: SortKey;
  currentSort: BuildingSortOption;
  search?: string;
}) {
  const { displayLabel, href, currentDirection, isActive } = buildSortHeaderProps({
    sortKey,
    currentSort,
    search,
  });

  return (
    <th
      scope="col"
      className={["px-4 py-3 align-middle font-semibold", align === "right" ? "text-right" : "text-left"].join(
        " ",
      )}
      aria-sort={isActive ? currentDirection : "none"}
    >
      <a
        href={href}
        className="text-muted-foreground hover:text-foreground inline-flex w-full items-center justify-end gap-1 text-xs uppercase tracking-wide transition-colors"
      >
        <span>{label}</span>
        {renderSortIcon(isActive ? currentDirection : "none")}
        <span className="sr-only">{displayLabel}</span>
      </a>
    </th>
  );
}

function buildSortHeaderProps({
  sortKey,
  currentSort,
  search,
}: {
  sortKey: SortKey;
  currentSort: BuildingSortOption;
  search?: string;
}) {
  const sortOption = resolveSortOption(sortKey, currentSort);
  const href = buildSortHref(sortOption.nextSort, search);
  const currentDirection = sortOption.currentDirection;
  const isActive = sortOption.isActive;
  const displayLabel = BUILDING_SORT_LABELS[sortOption.nextSort];

  return { href, currentDirection, isActive, displayLabel };
}

function renderSortIcon(direction: "ascending" | "descending" | "none") {
  switch (direction) {
    case "ascending":
      return <ArrowUp className="h-4 w-4" aria-hidden="true" />;
    case "descending":
      return <ArrowDown className="h-4 w-4" aria-hidden="true" />;
    default:
      return <ArrowUpDown className="h-4 w-4 opacity-60" aria-hidden="true" />;
  }
}

function resolveSortOption(sortKey: SortKey, current: BuildingSortOption) {
  const map: Record<
    SortKey,
    {
      options: BuildingSortOption[];
      directions: Partial<Record<BuildingSortOption, "ascending" | "descending">>;
    }
  > = {
    rating: {
      options: ["rating_desc", "rating_asc"],
      directions: {
        rating_desc: "descending",
        rating_asc: "ascending",
      },
    },
    review_count: {
      options: ["review_count_desc"],
      directions: {
        review_count_desc: "descending",
      },
    },
    rent: {
      options: ["rent_desc", "rent_asc"],
      directions: {
        rent_desc: "descending",
        rent_asc: "ascending",
      },
    },
  };

  const config = map[sortKey];
  const isActive = config.options.includes(current);

  if (!isActive) {
    const nextSort = config.options[0];
    return {
      nextSort,
      currentDirection: "none" as const,
      isActive: false,
    };
  }

  const currentIndex = config.options.indexOf(current);
  const nextIndex = (currentIndex + 1) % config.options.length;
  const nextSort = config.options[nextIndex];

  const direction = config.directions[current] ?? "descending";

  return {
    nextSort,
    currentDirection: direction,
    isActive: true,
  };
}

function MobileBuildingList({ items, hasData }: { items: BuildingListItem[]; hasData: boolean }) {
  if (!hasData) {
    return (
      <div className="sm:hidden">
        <p className="text-muted-foreground bg-muted/30 rounded-xl px-4 py-6 text-center text-sm">
          조건에 맞는 건물 결과가 없습니다. 다른 검색어를 입력해 보세요.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 sm:hidden">
      {items.map((item) => (
        <li
          key={item.room_id}
          className="border-border/60 hover:border-primary/60 bg-background rounded-xl border transition-colors"
        >
          <Link
            href={buildReviewLink(item.room_name)}
            className="focus-visible:ring-ring/70 focus-visible:ring-offset-background block h-full rounded-xl p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={`${item.room_name} 리뷰 보기`}
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground text-base font-semibold leading-tight">
                {item.room_name}
              </h3>
              <p className="text-muted-foreground text-xs">{item.room_address}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">평점</dt>
                <dd className="text-foreground text-base font-semibold">
                  {item.average_score ? item.average_score.toFixed(1) : "0.0"}
                  <span className="text-muted-foreground text-xs font-medium"> / 5.0</span>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">리뷰 수</dt>
                <dd className="text-foreground text-base font-semibold">
                  {item.review_count.toLocaleString("ko-KR")}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">연 임대료</dt>
                <dd className="text-foreground text-base font-semibold">
                  {formatAnnualRent(item.average_annual_rent, "연") ?? (
                    <span className="text-muted-foreground text-sm font-normal">자료 없음</span>
                  )}
                </dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BuildingRow({ building }: { building: BuildingListItem }) {
  const rentLabel = formatAnnualRent(building.average_annual_rent, "연");
  const rating = building.average_score ? building.average_score.toFixed(1) : "0.0";
  const reviewHref = buildReviewLink(building.room_name);

  return (
    <tr className="border-border/60 border-t text-sm transition-colors hover:bg-muted/20">
      <th scope="row" className="text-left align-top">
        <Link
          href={reviewHref}
          className="focus-visible:ring-ring/70 focus-visible:ring-offset-background flex flex-col gap-1 px-4 py-4 outline-none transition-colors focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={`${building.room_name} 리뷰 보기`}
        >
          <span className="text-foreground text-base font-medium leading-tight">
            {building.room_name}
          </span>
          <span className="text-muted-foreground text-xs">{building.room_address}</span>
        </Link>
      </th>
      <td className="px-4 py-4 text-right font-semibold">
        <span className="inline-flex items-center justify-end gap-1">
          <span className="text-foreground text-base">{rating}</span>
          <span className="text-muted-foreground text-xs">/ 5.0</span>
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-foreground text-base font-semibold">
          {building.review_count.toLocaleString("ko-KR")}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        {rentLabel ? (
          <span className="text-foreground text-base font-semibold">{rentLabel}</span>
        ) : (
          <span className="text-muted-foreground text-sm">자료 없음</span>
        )}
      </td>
    </tr>
  );
}

function buildReviewLink(roomName: string) {
  const search = encodeURIComponent(roomName);
  return `/reviews?q=${search}`;
}

function buildSortHref(nextSort: BuildingSortOption, search?: string) {
  const params = new URLSearchParams();
  params.set("sort", nextSort);
  if (search) {
    params.set("q", search);
  }
  return `?${params.toString()}`;
}
