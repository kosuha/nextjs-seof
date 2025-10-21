"use server";

import { revalidatePath } from "next/cache";
import { createBuilding } from "@/lib/data/buildings";
import { updateReviewEntry } from "@/lib/data/reviews";
import { getServerSession } from "@/lib/supabase/server";
import type { RentType } from "@/lib/types/supabase";
import {
  reviewFormSchema,
  type ReviewFormPayload,
} from "@/app/reviews/shared/review-form-schema";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

export async function updateReview(
  reviewId: number,
  payload: ReviewFormPayload,
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    return { ok: false, message: "잘못된 리뷰입니다." };
  }

  const parsed = reviewFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "입력 값을 확인해 주세요.",
    };
  }

  const data = parsed.data;

  let roomId: number;
  try {
    if (data.buildingSelection.mode === "existing") {
      roomId = data.buildingSelection.buildingId;
    } else {
      const building = await createBuilding({
        name: data.buildingSelection.name,
        address: data.address,
        postcode: data.postcode ?? null,
        author: session.user.id,
      });
      roomId = building.id;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "건물을 등록하지 못했습니다.";
    return { ok: false, message };
  }

  const normalizedContext = data.context?.trim()?.length ? data.context.trim() : null;

  try {
    await updateReviewEntry({
      id: reviewId,
      authorId: session.user.id,
      roomId,
      rentType: data.rentType as RentType,
      deposit: data.deposit ?? null,
      rent: data.rent ?? null,
      moveAt: data.moveAt,
      floor: data.floor ?? null,
      score: data.score,
      context: normalizedContext,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "리뷰를 수정하지 못했습니다.";
    return { ok: false, message };
  }

  revalidatePath("/mypage");
  revalidatePath("/reviews");

  return { ok: true };
}
