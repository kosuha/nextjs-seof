import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { formatAnnualRent } from "@/lib/utils/formatters";
import type { RentType } from "@/lib/types/supabase";

type ReviewRow = {
  id: number;
  created_at: string;
  edited_at: string | null;
  room_id: number;
  rent_type: RentType;
  deposit: number | null;
  rent: number | null;
  move_at: string;
  floor: string | null;
  score: number;
  context: string | null;
};

type RoomRow = {
  id: number;
  name: string;
  address: string;
  postcode: string | null;
};

export type MyReviewListItem = {
  id: number;
  createdAt: string;
  editedAt: string | null;
  roomId: number;
  roomName: string | null;
  roomAddress: string | null;
  roomPostcode: string | null;
  score: number;
  rentType: RentType;
  deposit: number | null;
  rent: number | null;
  moveAt: string;
  floor: string | null;
  context: string | null;
  annualRentLabel: string | null;
};

export async function fetchMyReviews(userId: string): Promise<MyReviewListItem[]> {
  const supabase = await createSupabaseServerComponentClient();

  const { data: reviewRowsRaw, error: reviewError } = await supabase
    .from("reviews")
    .select(
      "id, created_at, edited_at, room_id, rent_type, deposit, rent, move_at, floor, score, context",
    )
    .eq("author", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<ReviewRow[]>();

  if (reviewError) {
    throw new Error(`내 리뷰 목록을 불러오지 못했습니다: ${reviewError.message}`);
  }

  const reviewRows = reviewRowsRaw ?? [];

  if (!reviewRows.length) {
    return [];
  }

  const roomIds = Array.from(new Set(reviewRows.map((row) => row.room_id)));

  const roomMap = await fetchRoomsById(roomIds);

  return reviewRows.map((row) => {
    const room = roomMap.get(row.room_id) ?? null;
    const annualRent = calculateAnnualRent(row.rent_type, row.deposit, row.rent);

    return {
      id: row.id,
      createdAt: row.created_at,
      editedAt: row.edited_at,
      roomId: row.room_id,
      roomName: room?.name ?? null,
      roomAddress: room?.address ?? null,
      roomPostcode: room?.postcode ?? null,
      score: Number(row.score),
      rentType: row.rent_type,
      deposit: row.deposit,
      rent: row.rent,
      moveAt: row.move_at,
      floor: row.floor,
      context: row.context,
      annualRentLabel: annualRent,
    };
  });
}

export async function fetchMyReviewCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerComponentClient();

  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author", userId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`내 리뷰 수를 불러오지 못했습니다: ${error.message}`);
  }

  return count ?? 0;
}

async function fetchRoomsById(ids: number[]) {
  const supabase = await createSupabaseServerComponentClient();

  if (!ids.length) {
    return new Map<number, RoomRow>();
  }

  const { data: roomRowsRaw, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, address, postcode")
    .in("id", ids)
    .returns<RoomRow[]>();

  if (roomError) {
    throw new Error(`연결된 건물 정보를 불러오지 못했습니다: ${roomError.message}`);
  }

  const roomRows = roomRowsRaw ?? [];
  const roomMap = new Map<number, RoomRow>();
  roomRows.forEach((room) => {
    roomMap.set(room.id, room);
  });
  return roomMap;
}

function calculateAnnualRent(
  rentType: RentType,
  deposit: number | null,
  rent: number | null,
) {
  switch (rentType) {
    case "월세":
      return formatAnnualRent(rent !== null ? rent * 12 : null, "연");
    case "사글세":
      return formatAnnualRent(rent, "연");
    case "전세":
      return formatAnnualRent(deposit, "보증금");
    default:
      return null;
  }
}
