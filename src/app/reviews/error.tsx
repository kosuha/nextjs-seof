"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReviewsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ReviewsError({ error, reset }: ReviewsErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full">
        <AlertCircle className="size-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="text-foreground text-2xl font-semibold">
          리뷰를 불러오지 못했어요.
        </h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "잠시 후 다시 시도해 주세요."}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
