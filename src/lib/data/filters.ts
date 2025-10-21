import { z } from "zod";
import type { RentType } from "@/lib/types/supabase";

export const reviewSortOptions = [
  "latest",
  "rating_desc",
  "rating_asc",
  "rent_desc",
  "rent_asc",
] as const;

export const buildingSortOptions = [
  "rating_desc",
  "rating_asc",
  "rent_desc",
  "rent_asc",
  "review_count_desc",
] as const;

export const rentTypeOptions: RentType[] = ["월세", "전세", "사글세"];

export type ReviewSortOption = (typeof reviewSortOptions)[number];
export type BuildingSortOption = (typeof buildingSortOptions)[number];

const rentTypeSchema = z.union([
  z.literal("월세"),
  z.literal("전세"),
  z.literal("사글세"),
]);

export const reviewQuerySchema = z
  .object({
    sort: z.enum(reviewSortOptions).default("latest"),
    rentType: rentTypeSchema.nullish(),
    search: z
      .string()
      .trim()
      .max(120)
      .nullish()
      .transform((value) => (value === "" ? undefined : value)),
    limit: z.number().int().positive().max(100).default(20),
    offset: z.number().int().min(0).default(0),
  })
  .transform((value) => ({
    sort: value.sort,
    rentType: value.rentType ?? undefined,
    search: value.search ?? undefined,
    limit: value.limit,
    offset: value.offset,
  }));

export type ReviewQueryParams = z.infer<typeof reviewQuerySchema>;

export const buildingQuerySchema = z
  .object({
    sort: z.enum(buildingSortOptions).default("rating_desc"),
    search: z
      .string()
      .trim()
      .max(120)
      .nullish()
      .transform((value) => (value === "" ? undefined : value)),
    limit: z.number().int().positive().max(100).default(20),
    offset: z.number().int().min(0).default(0),
  })
  .transform((value) => ({
    sort: value.sort,
    search: value.search ?? undefined,
    limit: value.limit,
    offset: value.offset,
  }));

export type BuildingQueryParams = z.infer<typeof buildingQuerySchema>;

export type RentTypeFilter = RentType | undefined;

export const isReviewSortOption = (value: unknown): value is ReviewSortOption =>
  typeof value === "string" && reviewSortOptions.includes(value as ReviewSortOption);

export const isBuildingSortOption = (value: unknown): value is BuildingSortOption =>
  typeof value === "string" && buildingSortOptions.includes(value as BuildingSortOption);

export const isRentType = (value: unknown): value is RentType =>
  typeof value === "string" && rentTypeOptions.includes(value as RentType);

export const REVIEW_SORT_LABELS: Record<ReviewSortOption, string> = {
  latest: "최신순",
  rating_desc: "평점 높은 순",
  rating_asc: "평점 낮은 순",
  rent_desc: "임대료 높은 순",
  rent_asc: "임대료 낮은 순",
};

export const BUILDING_SORT_LABELS: Record<BuildingSortOption, string> = {
  rating_desc: "평점 높은 순",
  rating_asc: "평점 낮은 순",
  rent_desc: "임대료 높은 순",
  rent_asc: "임대료 낮은 순",
  review_count_desc: "리뷰 많은 순",
};
