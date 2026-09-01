"use client";

import { useTransition } from "react";
import { revealToday } from "@/app/dashboard/actions";

export function RevealTodayButton({ revealed }: { revealed: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (revealed) {
    return (
      <p className="text-center text-sm opacity-70">오늘 조각을 이미 공개했습니다.</p>
    );
  }

  return (
    <button
      onClick={() => startTransition(() => revealToday())}
      disabled={isPending}
      className="mx-auto block rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {isPending ? "공개 중..." : "오늘의 조각 공개하기"}
    </button>
  );
}
