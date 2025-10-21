import { ReviewFormClient, type ReviewFormClientProps } from "./review-form-client";

export type ReviewFormContainerProps = ReviewFormClientProps;

export function ReviewFormContainer(props: ReviewFormContainerProps) {
  return <ReviewFormClient {...props} />;
}
