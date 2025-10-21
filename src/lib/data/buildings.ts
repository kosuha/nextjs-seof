import {
  createSupabaseRouteHandlerClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import type { BuildingSummary } from "@/lib/types/supabase";
import {
  buildingQuerySchema,
  type BuildingQueryParams,
  type BuildingSortOption,
} from "@/lib/data/filters";
import {
  BUILDING_NAME_PATTERN,
  BUILDING_NAME_PATTERN_MESSAGE,
} from "@/lib/constants/building";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerComponentClient>>;
type RouteSupabaseClient = Awaited<ReturnType<typeof createSupabaseRouteHandlerClient>>;

type OrderableQuery<T> = {
  order: (
    column: string,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
      nullsLast?: boolean;
      foreignTable?: string;
    },
  ) => T;
};

export type BuildingListItem = BuildingSummary & {
  average_score: number;
  average_annual_rent: number | null;
};

export type BuildingListResult = {
  items: BuildingListItem[];
  count: number;
  params: BuildingQueryParams;
  hasMore: boolean;
  nextOffset: number;
};

export type BuildingOption = {
  id: number;
  name: string;
  address: string;
  postcode: string | null;
};

export type BuildingNameConflictErrorCode = "BUILDING_NAME_CONFLICT";

export class BuildingNameConflictError extends Error {
  readonly code: BuildingNameConflictErrorCode = "BUILDING_NAME_CONFLICT";

  constructor(message = "동일한 주소에 이미 등록된 건물 이름입니다.") {
    super(message);
    this.name = "BuildingNameConflictError";
  }
}

export async function fetchBuildings(
  rawParams: Partial<BuildingQueryParams> = {},
): Promise<BuildingListResult> {
  const params = buildingQuerySchema.parse(rawParams);
  const supabase = await createSupabaseServerComponentClient();

  let query = supabase
    .from("room_review_stats")
    .select("*", { count: "exact" })
    .range(params.offset, params.offset + params.limit - 1);

  if (params.search) {
    query = query.ilike("room_name", `%${params.search}%`);
  }

  query = applyBuildingSort(query, params.sort);

  const { data, count, error } = await query.returns<BuildingSummary[]>();

  if (error) {
    throw new Error(`건물 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
  }

  const totalCount = count ?? 0;

  let items = (data ?? []).map((building) => ({
    ...building,
    average_score: Number(building.average_score ?? 0),
    average_annual_rent: building.average_annual_rent,
  }));

  if (params.sort === "rating_desc" || params.sort === "rating_asc") {
    const withReviews = items.filter((item) => item.review_count > 0);
    const withoutReviews = items.filter((item) => item.review_count === 0);
    items = [...withReviews, ...withoutReviews];
  }

  const nextOffset = Math.min(params.offset + params.limit, totalCount);
  const hasMore = params.offset + params.limit < totalCount;

  return {
    items,
    count: totalCount,
    params,
    hasMore,
    nextOffset,
  };
}

export async function searchBuildingsByAddress(address: string): Promise<BuildingOption[]> {
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, address, postcode")
    .eq("address", trimmed)
    .order("name", { ascending: true })
    .limit(20);

  if (error) {
    throw new Error(`건물 정보를 조회하지 못했습니다: ${error.message}`);
  }

  return (data ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    address: room.address,
    postcode: room.postcode ?? null,
  }));
}

export async function createBuilding(input: {
  name: string;
  address: string;
  postcode?: string | null;
  author: string;
}): Promise<BuildingOption> {
  const supabase = await createSupabaseRouteHandlerClient();
  const trimmedName = input.name.trim();
  const trimmedAddress = input.address.trim();

  if (!trimmedName) {
    throw new Error("건물 이름을 입력해 주세요.");
  }

  if (!trimmedAddress) {
    throw new Error("주소를 입력해 주세요.");
  }

  if (!BUILDING_NAME_PATTERN.test(trimmedName)) {
    throw new Error(BUILDING_NAME_PATTERN_MESSAGE);
  }

  await assertBuildingNameUnique(supabase, trimmedName, trimmedAddress);
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name: trimmedName,
      address: trimmedAddress,
      postcode: input.postcode ?? null,
      author: input.author,
    })
    .select("id, name, address, postcode")
    .single();

  if (error || !data) {
    throw new Error(`건물을 생성하지 못했습니다: ${error?.message ?? "알 수 없는 오류"}`);
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    postcode: data.postcode ?? null,
  };
}

async function assertBuildingNameUnique(
  client: RouteSupabaseClient,
  name: string,
  address: string,
): Promise<void> {
  const { count, error } = await client
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("name", name)
    .eq("address", address)
    .limit(1);

  if (error) {
    throw new Error(`건물 정보를 확인하지 못했습니다: ${error.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new BuildingNameConflictError();
  }
}

function applyBuildingSort<T extends OrderableQuery<T>>(query: T, sort: BuildingSortOption): T {
  switch (sort) {
    case "rating_desc":
      return query.order("average_score", { ascending: false, nullsLast: true });
    case "rating_asc":
      return query.order("average_score", { ascending: true, nullsLast: false });
    case "rent_desc":
      return query.order("average_annual_rent", { ascending: false, nullsLast: true });
    case "rent_asc":
      return query.order("average_annual_rent", { ascending: true, nullsLast: false });
    case "review_count_desc":
      return query.order("review_count", { ascending: false, nullsLast: true });
    default:
      return query;
  }
}
