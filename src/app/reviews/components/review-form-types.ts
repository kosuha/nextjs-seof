import { z } from "zod";

export const RENT_TYPES = ["사글세", "월세", "전세"] as const;

export const REVIEW_FORM_STEPS = ["주소 및 건물 선택", "임대 정보 입력", "리뷰 작성"] as const;

export const reviewFormSchema = z.object({
  address: z.string().min(1, "주소를 선택해 주세요."),
  postcode: z.string().optional(),
  buildingId: z.string().optional(),
  newBuildingName: z.string().optional(),
  rentType: z.enum(RENT_TYPES),
  deposit: z.string().optional(),
  rent: z.string().optional(),
  moveAt: z.string().min(1, "입주 날짜를 입력해 주세요."),
  floor: z.string().optional(),
  score: z.coerce.number().min(0.5).max(5),
  context: z.string().max(4000, "리뷰는 최대 4000자까지 작성할 수 있습니다.").optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export type BuildingOption = {
  id: number;
  name: string;
  address: string;
  postcode: string | null;
};

export type ReviewFormSubmitPayload = {
  address: string;
  postcode: string | null;
  buildingSelection:
    | { mode: "existing"; buildingId: number }
    | { mode: "new"; name: string };
  rentType: (typeof RENT_TYPES)[number];
  deposit: number | null;
  rent: number | null;
  moveAt: string;
  floor: string | null;
  score: number;
  context: string | null;
};

export type ReviewFormSubmitResult = { ok: boolean; message?: string };

export const DEFAULT_REVIEW_FORM_VALUES: ReviewFormValues = {
  address: "",
  postcode: "",
  buildingId: "",
  newBuildingName: "",
  rentType: "사글세",
  deposit: "",
  rent: "",
  moveAt: "",
  floor: "지하",
  score: 3,
  context: "",
};
