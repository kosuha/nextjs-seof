"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createSupabaseRouteHandlerClient,
  getServerSession,
} from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { RentType } from "@/lib/types/supabase";
import type { Database } from "@/lib/types/supabase";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

const rentSchema = z.union([z.number().min(0), z.null()]);

const reviewUpdateSchema = z.object({
  id: z.number(),
  score: z.number().min(0).max(5),
  rentType: z.enum(["월세", "전세", "사글세"]),
  deposit: rentSchema,
  rent: rentSchema,
  moveAt: z.string().min(1).max(32),
  floor: z.union([z.string().max(32), z.null()]).optional(),
  context: z.union([z.string().max(2000), z.null()]).optional(),
});

type UpdateReviewInput = {
  id: number;
  score: number;
  rentType: RentType;
  deposit?: number | null;
  rent?: number | null;
  moveAt: string;
  floor?: string | null;
  context?: string | null;
};

export async function updateReview(input: UpdateReviewInput): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const sanitized = {
    ...input,
    deposit: normalizeNullableNumber(input.deposit),
    rent: normalizeNullableNumber(input.rent),
    moveAt: input.moveAt.trim(),
    floor: normalizeNullableString(input.floor),
    context: normalizeNullableString(input.context),
  };

  const parsed = reviewUpdateSchema.safeParse(sanitized);
  if (!parsed.success) {
    return { ok: false, message: "입력 값을 다시 확인해 주세요." };
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const payload = parsed.data;
  const updatePayload: Database["public"]["Tables"]["reviews"]["Update"] = {
    score: payload.score,
    rent_type: payload.rentType,
    deposit: payload.deposit,
    rent: payload.rent,
    move_at: payload.moveAt,
    floor: payload.floor ?? null,
    context: payload.context ?? null,
    edited_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("reviews")
    .update(updatePayload)
    .eq("id", payload.id)
    .eq("author", session.user.id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: "리뷰를 수정하는 중 오류가 발생했습니다." };
  }

  revalidatePath("/mypage");

  return { ok: true };
}

const reviewDeleteSchema = z.object({
  id: z.number(),
});

export async function deleteReview(input: { id: number }): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const parsed = reviewDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "잘못된 요청입니다." };
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const deletePayload: Database["public"]["Tables"]["reviews"]["Update"] = {
    deleted_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("reviews")
    .update(deletePayload)
    .eq("id", parsed.data.id)
    .eq("author", session.user.id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: "리뷰를 삭제하지 못했습니다." };
  }

  revalidatePath("/mypage");
  return { ok: true };
}

export async function deleteAccount(): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, message: "이미 로그아웃된 상태입니다." };
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const userId = session.user.id;
  const timestamp = new Date().toISOString();
  const softDeletePayload: Database["public"]["Tables"]["reviews"]["Update"] = {
    deleted_at: timestamp,
  };

  const { error: reviewCleanupError } = await supabase
    .from("reviews")
    .update(softDeletePayload)
    .eq("author", userId)
    .is("deleted_at", null);

  if (reviewCleanupError) {
    return { ok: false, message: "연결된 리뷰 데이터를 정리하지 못했습니다." };
  }

  const { error: userRowError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);
  if (userRowError) {
    return { ok: false, message: "사용자 정보를 삭제하지 못했습니다." };
  }

  try {
    const serviceClient = createSupabaseServiceRoleClient();
    const { error: adminError } = await serviceClient.auth.admin.deleteUser(userId);
    if (adminError) {
      return { ok: false, message: "계정을 완전히 삭제하지 못했습니다." };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "서비스 계정 초기화 중 알 수 없는 오류가 발생했습니다." };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return { ok: true };
}

function normalizeNullableNumber(value: number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function normalizeNullableString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
