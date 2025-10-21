import { z } from "zod";

export const RENT_TYPES = ["월세", "전세", "사글세"] as const;

export const buildingSelectionSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existing"),
    buildingId: z.number().int().positive(),
  }),
  z.object({
    mode: z.literal("new"),
    name: z.string().trim().min(1, "건물 이름을 입력해 주세요.").max(120),
  }),
]);

export const reviewFormSchema = z
  .object({
    address: z.string().trim().min(1, "주소를 선택해 주세요."),
    postcode: z.string().trim().max(20).nullish(),
    buildingSelection: buildingSelectionSchema,
    rentType: z.enum(RENT_TYPES),
    deposit: z.number().min(0).nullable(),
    rent: z.number().min(0).nullable(),
    moveAt: z.string().trim().min(1, "입주 날짜를 입력해 주세요.").max(32),
    floor: z.string().trim().max(32).nullable(),
    score: z.number().min(0.5).max(5),
    context: z.string().max(4000).nullable(),
  })
  .superRefine((value, ctx) => {
    const { rentType } = value;

    const ensureNumber = (num: number | null | undefined, message: string) => {
      if (num === null || typeof num === "undefined") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        });
        return false;
      }
      return true;
    };

    switch (rentType) {
      case "월세": {
        ensureNumber(value.deposit, "보증금을 입력해 주세요.");
        ensureNumber(value.rent, "월세를 입력해 주세요.");
        break;
      }
      case "전세": {
        ensureNumber(value.deposit, "전세 보증금을 입력해 주세요.");
        if (value.rent !== null && typeof value.rent !== "undefined") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "전세에서는 월세를 입력할 수 없습니다.",
          });
        }
        break;
      }
      case "사글세": {
        ensureNumber(value.deposit, "사글세 보증금을 입력해 주세요.");
        ensureNumber(value.rent, "1년 사글세 금액을 입력해 주세요.");
        break;
      }
    }

    const stepCheck = Math.abs((value.score * 2) % 1);
    if (stepCheck > 1e-8 && Math.abs(stepCheck - 1) > 1e-8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "평점은 0.5점 단위여야 합니다.",
      });
    }
  });

export type ReviewFormPayload = z.infer<typeof reviewFormSchema>;
