import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewFormContainer } from "@/app/reviews/components/review-form-container";
import type { ReviewFormValues } from "@/app/reviews/components/review-form-types";
import { fetchBuildingsForAddress } from "@/app/reviews/new/actions";
import { updateReview } from "@/app/reviews/[id]/edit/actions";
import { requireSession } from "@/lib/auth/actions";
import { searchBuildingsByAddress } from "@/lib/data/buildings";
import { fetchReviewForEdit } from "@/lib/data/reviews";

type ReviewEditPageProps = {
  params?: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "리뷰 수정 | seof",
  description: "기존 리뷰를 수정하고 건물 정보를 업데이트하세요.",
};

export default async function ReviewEditPage({ params }: ReviewEditPageProps) {
  const session = await requireSession();

  const resolvedParams = params ? await params : null;
  const reviewId = Number(resolvedParams?.id);
  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    notFound();
  }

  const review = await fetchReviewForEdit(reviewId, session.user.id);
  if (!review) {
    notFound();
  }

  const fetchedOptions = review.roomAddress
    ? await searchBuildingsByAddress(review.roomAddress)
    : [];

  const hasCurrentRoom = fetchedOptions.some((option) => option.id === review.roomId);
  const initialBuildingOptions = hasCurrentRoom
    ? fetchedOptions
    : review.roomAddress
      ? [
          ...fetchedOptions,
          {
            id: review.roomId,
            name: review.roomName ?? `건물 #${review.roomId}`,
            address: review.roomAddress,
            postcode: review.roomPostcode ?? null,
          },
        ]
      : fetchedOptions;

  const initialValues: Partial<ReviewFormValues> = {
    address: review.roomAddress ?? "",
    postcode: review.roomPostcode ?? "",
    buildingId: review.roomId ? String(review.roomId) : "",
    newBuildingName: "",
    rentType: review.rentType,
    deposit: review.deposit !== null ? String(review.deposit) : "",
    rent: review.rent !== null ? String(review.rent) : "",
    moveAt: review.moveAt,
    floor: review.floor ?? "",
    score: review.score,
    context: review.context ?? "",
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 md:py-16">
      <ReviewFormContainer
        heading="리뷰 수정"
        mode="edit"
        submitLabel="수정 완료"
        successMessage="리뷰가 수정되었습니다. 마이페이지로 이동합니다."
        onSuccessRedirect="/mypage"
        fetchBuildingsAction={fetchBuildingsForAddress}
        submitAction={updateReview.bind(null, review.id)}
        initialAddress={review.roomAddress ?? ""}
        initialPostcode={review.roomPostcode}
        initialBuildingOptions={initialBuildingOptions}
        initialValues={initialValues}
      />
    </div>
  );
}
