import { Suspense } from "react";
import { ContainerShell } from "@/app/components/container-shell";
import { fetchBuildings } from "@/lib/data/buildings";
import {
  buildingSortOptions,
  isBuildingSortOption,
  type BuildingSortOption,
} from "@/lib/data/filters";
import { BuildingFeedClient } from "@/app/buildings/components/building-feed-client";

type RawSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_LIMIT = 20;

export default async function BuildingsPage({
  searchParams,
}: {
  searchParams?: Promise<RawSearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const normalizedParams = normalizeSearchParams(resolvedSearchParams);
  const suspenseKey = buildSuspenseKey(normalizedParams);

  return (
    <ContainerShell as="main" className="flex flex-col gap-10 py-12 sm:py-16">
      <header className="space-y-3">
        <p className="text-primary text-sm font-medium uppercase tracking-wider">Building Index</p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          건물별 지표 확인하기
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm sm:text-base">
          평균 평점, 리뷰 수, 연 임대료 정보를 정렬하거나 검색해 원하는 건물을 빠르게 찾아보세요.
        </p>
      </header>

      <Suspense key={suspenseKey} fallback={<BuildingListSkeleton />}>
        <BuildingList params={normalizedParams} />
      </Suspense>
    </ContainerShell>
  );
}

type NormalizedParams = {
  sort: BuildingSortOption;
  search?: string;
};

async function BuildingList({ params }: { params: NormalizedParams }) {
  const { items, count, params: resolvedParams, hasMore, nextOffset } = await fetchBuildings({
    sort: params.sort,
    search: params.search,
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  return (
    <BuildingFeedClient
      initialItems={items}
      totalCount={count}
      sort={resolvedParams.sort}
      search={resolvedParams.search}
      pageSize={DEFAULT_LIMIT}
      initialHasMore={hasMore}
      initialNextOffset={hasMore ? nextOffset : null}
    />
  );
}

function normalizeSearchParams(searchParams?: RawSearchParams): NormalizedParams {
  const sort = extractSort(searchParams?.sort);
  const search = extractSearch(searchParams?.q);

  return {
    sort,
    search,
  };
}

function extractSort(value: string | string[] | undefined): BuildingSortOption {
  if (!value) return buildingSortOptions[0];
  if (Array.isArray(value)) {
    return value.find(isBuildingSortOption) ?? buildingSortOptions[0];
  }
  return isBuildingSortOption(value) ? value : buildingSortOptions[0];
}

function extractSearch(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildSuspenseKey(params: NormalizedParams) {
  return [params.sort, params.search ?? ""].join("|");
}

function BuildingListSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="bg-muted/60 h-5 w-36 animate-pulse rounded-full" />
        <div className="bg-muted/50 h-4 w-48 animate-pulse rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="bg-muted/40 h-10 animate-pulse rounded-lg" />
        <div className="bg-muted/30 h-10 animate-pulse rounded-lg" />
        <div className="bg-muted/30 h-10 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
