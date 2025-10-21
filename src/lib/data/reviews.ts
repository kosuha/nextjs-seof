import {
  createSupabaseRouteHandlerClient,
  createSupabaseServerComponentClient,
} from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { ReviewSummary, RentType } from "@/lib/types/supabase";
import {
  reviewQuerySchema,
  type ReviewQueryParams,
  type ReviewSortOption,
} from "@/lib/data/filters";
import { formatAnnualRent } from "@/lib/utils/formatters";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerComponentClient>>;
type RouteSupabaseClient = Awaited<ReturnType<typeof createSupabaseRouteHandlerClient>>;

export const MAX_REVIEWS_PER_USER = 4;

export type ReviewLimitErrorCode = "MAX_REVIEW_LIMIT" | "DUPLICATE_BUILDING_REVIEW";

export class ReviewLimitError extends Error {
  readonly code: ReviewLimitErrorCode;

  constructor(code: ReviewLimitErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ReviewLimitError";
  }
}

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

export type ReviewListItem = ReviewSummary & {
  annualRentLabel: string | null;
};

export type ReviewListResult = {
  items: ReviewListItem[];
  count: number;
  params: ReviewQueryParams;
  nextOffset: number;
  hasMore: boolean;
};

export async function fetchReviews(
  rawParams: Partial<ReviewQueryParams> = {},
): Promise<ReviewListResult> {
  const params = reviewQuerySchema.parse(rawParams);
  const supabase = await createSupabaseServerComponentClient();

  let query = supabase
    .from("reviews_with_room_summary")
    .select("*", { count: "exact" })
    .range(params.offset, params.offset + params.limit - 1);

  if (params.rentType) {
    query = query.eq("rent_type", params.rentType);
  }

  if (params.search) {
    query = query.ilike("room_name", `%${params.search}%`);
  }

  query = applyReviewSort(query, params.sort);

  const { data, count, error } = await query.returns<ReviewSummary[]>();

  if (error) {
    throw new Error(`리뷰 데이터를 불러오지 못했습니다: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const items = (data ?? []).map((row) => ({
    ...row,
    annualRentLabel: getAnnualRentLabel(row.annual_rent, row.rent_type),
  }));

  const nextOffset = Math.min(params.offset + params.limit, totalCount);
  const hasMore = params.offset + params.limit < totalCount;

  return {
    items,
    count: totalCount,
    params,
    nextOffset,
    hasMore,
  };
}

function applyReviewSort<T extends OrderableQuery<T>>(query: T, sort: ReviewSortOption): T {
  switch (sort) {
    case "latest":
      return query.order("created_at", { ascending: false, nullsLast: true });
    case "rating_desc":
      return query.order("score", { ascending: false, nullsLast: true });
    case "rating_asc":
      return query.order("score", { ascending: true, nullsLast: false });
    case "rent_desc":
      return query.order("annual_rent", { ascending: false, nullsLast: true });
    case "rent_asc":
      return query.order("annual_rent", { ascending: true, nullsLast: false });
    default:
      return query;
  }
}

function getAnnualRentLabel(value: number | null, rentType: RentType) {
  switch (rentType) {
    case "월세":
    case "사글세":
      return formatAnnualRent(value, "연");
    case "전세":
      return formatAnnualRent(value, "보증금");
    default:
      return null;
  }
}

export type ReviewCreateInput = {
  roomId: number;
  rentType: RentType;
  deposit?: number | null;
  rent?: number | null;
  moveAt: string;
  floor?: string | null;
  score: number;
  context?: string | null;
  author: string;
};

export async function createReview(input: ReviewCreateInput): Promise<number> {
  const supabase = await createSupabaseRouteHandlerClient();

  await assertUserReviewLimit(supabase, input.author);
  await assertDuplicateReviewAbsent(supabase, input.author, input.roomId);

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      room_id: input.roomId,
      rent_type: input.rentType,
      deposit: input.deposit ?? null,
      rent: input.rent ?? null,
      move_at: input.moveAt,
      floor: input.floor ?? null,
      score: input.score,
      context: input.context ?? null,
      author: input.author,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`리뷰를 저장하지 못했습니다: ${error?.message ?? "알 수 없는 오류"}`);
  }

  return data.id;
}

export async function ensureUserCanCreateReview(authorId: string): Promise<void> {
  const supabase = await createSupabaseRouteHandlerClient();
  await assertUserReviewLimit(supabase, authorId);
}

async function assertUserReviewLimit(client: RouteSupabaseClient, authorId: string): Promise<void> {
  const { count, error } = await client
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author", authorId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`리뷰 제한 정보를 확인하지 못했습니다: ${error.message}`);
  }

  if ((count ?? 0) >= MAX_REVIEWS_PER_USER) {
    throw new ReviewLimitError("MAX_REVIEW_LIMIT", "리뷰는 최대 4개까지만 작성할 수 있습니다.");
  }
}

async function assertDuplicateReviewAbsent(
  client: RouteSupabaseClient,
  authorId: string,
  roomId: number,
): Promise<void> {
  const { count, error } = await client
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author", authorId)
    .eq("room_id", roomId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`리뷰 제한 정보를 확인하지 못했습니다: ${error.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new ReviewLimitError(
      "DUPLICATE_BUILDING_REVIEW",
      "같은 건물에 대한 리뷰는 한 개만 작성할 수 있습니다.",
    );
  }
}

export type ReviewForEdit = {
  id: number;
  roomId: number;
  roomName: string | null;
  roomAddress: string | null;
  roomPostcode: string | null;
  rentType: RentType;
  deposit: number | null;
  rent: number | null;
  moveAt: string;
  floor: string | null;
  score: number;
  context: string | null;
};

export async function fetchReviewForEdit(
  reviewId: number,
  authorId: string,
): Promise<ReviewForEdit | null> {
  const supabase = await createSupabaseServerComponentClient();

  type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
  type RoomSummary = Pick<
    Database["public"]["Tables"]["rooms"]["Row"],
    "id" | "name" | "address" | "postcode"
  >;

  const { data: review, error } = await supabase
    .from("reviews")
    .select("id, room_id, rent_type, deposit, rent, move_at, floor, score, context")
    .eq("id", reviewId)
    .eq("author", authorId)
    .is("deleted_at", null)
    .returns<ReviewRow[]>()
    .maybeSingle();

  if (error) {
    throw new Error(`리뷰 정보를 불러오지 못했습니다: ${error.message}`);
  }

  if (!review) {
    return null;
  }

  let room: RoomSummary | null = null;
  if (review.room_id) {
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("id, name, address, postcode")
      .eq("id", review.room_id)
      .returns<RoomSummary[]>()
      .maybeSingle();

    if (roomError) {
      throw new Error(`건물 정보를 불러오지 못했습니다: ${roomError.message}`);
    }
    room = roomData ?? null;
  }

  return {
    id: review.id,
    roomId: review.room_id,
    roomName: room?.name ?? null,
    roomAddress: room?.address ?? null,
    roomPostcode: room?.postcode ?? null,
    rentType: review.rent_type,
    deposit: review.deposit ?? null,
    rent: review.rent ?? null,
    moveAt: review.move_at,
    floor: review.floor ?? null,
    score: Number(review.score),
    context: review.context ?? null,
  };
}

type ReviewUpdateInput = {
  id: number;
  authorId: string;
  roomId: number;
  rentType: RentType;
  deposit: number | null;
  rent: number | null;
  moveAt: string;
  floor: string | null;
  score: number;
  context: string | null;
};

export async function updateReviewEntry(input: ReviewUpdateInput): Promise<void> {
  const supabase = await createSupabaseRouteHandlerClient();

  const { error } = await supabase
    .from("reviews")
    .update({
      room_id: input.roomId,
      rent_type: input.rentType,
      deposit: input.deposit,
      rent: input.rent,
      move_at: input.moveAt,
      floor: input.floor,
      score: input.score,
      context: input.context,
      edited_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("author", input.authorId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`리뷰를 수정하지 못했습니다: ${error.message}`);
  }
}
