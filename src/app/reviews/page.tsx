import { Suspense } from "react";
import type { RentType } from "@/lib/types/supabase";
import {
  isRentType,
  isReviewSortOption,
  reviewSortOptions,
  type ReviewSortOption,
} from "@/lib/data/filters";
import { fetchReviews } from "@/lib/data/reviews";
import { ReviewFeedClient } from "@/app/reviews/components/review-feed-client";

const DEFAULT_LIMIT = 20;

type RawSearchParams = Record<string, string | string[] | undefined>;

type ReviewsSearchParams = {
  sort: ReviewSortOption;
  rentType?: RentType;
  search?: string;
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const normalizedParams = normalizeSearchParams(resolvedSearchParams);

  const suspenseKey = buildSuspenseKey(normalizedParams);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12 sm:py-16">
      <header className="space-y-3">
        <p className="text-primary text-sm font-medium tracking-wider uppercase">
          Review Archive
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          자취방 리뷰 한눈에 보기
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          실제 거주자들이 남긴 후기와 임대료 정보를 확인하고, 조건에 맞게 정렬하거나
          검색해 보세요.
        </p>
      </header>

      <Suspense key={suspenseKey} fallback={<ReviewFeedSkeleton />}>
        <ReviewFeed initialParams={normalizedParams} />
      </Suspense>
    </div>
  );
}

async function ReviewFeed({ initialParams }: { initialParams: ReviewsSearchParams }) {
  const { items, count, params, hasMore, nextOffset } = await fetchReviews({
    ...initialParams,
    limit: DEFAULT_LIMIT,
  });

  return (
    <ReviewFeedClient
      initialItems={items}
      totalCount={count}
      sort={params.sort}
      rentType={params.rentType}
      search={params.search}
      pageSize={params.limit}
      initialHasMore={hasMore}
      initialNextOffset={hasMore ? nextOffset : null}
    />
  );
}

function ReviewFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm">
        <div className="bg-muted/80 h-5 w-48 animate-pulse rounded-full" />
        <div className="bg-muted/70 h-10 w-full animate-pulse rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-muted/60 h-44 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function normalizeSearchParams(searchParams?: RawSearchParams): ReviewsSearchParams {
  const sort = extractSort(searchParams?.sort);
  const rentType = extractRentType(searchParams?.rentType);
  const search = extractSearch(searchParams?.q);

  return {
    sort,
    rentType,
    search,
  };
}

function buildSuspenseKey(params: ReviewsSearchParams) {
  return [params.sort, params.rentType ?? "", params.search ?? ""].join("|");
}

function extractSort(value: string | string[] | undefined): ReviewSortOption {
  if (!value) return reviewSortOptions[0];
  if (Array.isArray(value)) {
    return value.find(isReviewSortOption) ?? reviewSortOptions[0];
  }
  return isReviewSortOption(value) ? value : reviewSortOptions[0];
}

function extractRentType(value: string | string[] | undefined): RentType | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.find(isRentType);
  }
  return isRentType(value) ? value : undefined;
}

function extractSearch(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
