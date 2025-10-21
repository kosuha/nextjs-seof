import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/actions";
import { ReviewCreateForm } from "@/app/reviews/new/review-create-form";

export const metadata: Metadata = {
  title: "리뷰 작성 | seof",
  description: "주소 검색으로 건물을 선택하고 거주 후기를 작성해 주세요.",
};

export default async function ReviewCreatePage() {
  await requireSession();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 md:py-16">
      <ReviewCreateForm />
    </div>
  );
}
