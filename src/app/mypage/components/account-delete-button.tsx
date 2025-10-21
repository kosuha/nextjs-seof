"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/app/mypage/actions";

export function AccountDeleteButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setMessage(null);

    startTransition(() => {
      deleteAccount().then((result) => {
        if (result.ok) {
          router.replace("/");
          router.refresh();
        } else {
          setMessage(result.message);
        }
      });
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full border-destructive bg-background text-destructive hover:bg-destructive/10 sm:w-auto"
        onClick={handleDelete}
        disabled={isPending}
      >
        <AlertTriangle className="size-4" />
        {isPending ? "탈퇴 처리 중..." : "회원 탈퇴"}
      </Button>
      {message ? <p className="text-destructive text-xs">{message}</p> : null}
    </div>
  );
}
