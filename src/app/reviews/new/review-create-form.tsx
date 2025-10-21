import { ReviewFormContainer } from "@/app/reviews/components/review-form-container";
import { fetchBuildingsForAddress, submitReview } from "@/app/reviews/new/actions";

export function ReviewCreateForm() {
  return (
    <ReviewFormContainer
      heading="리뷰 작성"
      mode="create"
      submitLabel="작성 완료"
      successMessage="리뷰가 저장되었습니다. 목록 페이지로 이동합니다."
      onSuccessRedirect="/reviews"
      fetchBuildingsAction={fetchBuildingsForAddress}
      submitAction={submitReview}
    />
  );
}
