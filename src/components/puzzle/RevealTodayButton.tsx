"use client";

import { useTransition } from "react";
import { Puzzle, Check } from "lucide-react";
import { revealToday } from "@/app/dashboard/actions";

export function RevealTodayButton({ revealed }: { revealed: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (revealed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <Check className="size-6" strokeWidth={2.5} />
        </div>
        <p className="text-xs text-muted-foreground">오늘 조각을 공개했습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label="오늘의 조각 공개하기"
        onClick={() => startTransition(() => revealToday())}
        disabled={isPending}
        className="group flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/25 transition duration-200 hover:scale-105 hover:shadow-accent/40 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
      >
        <Puzzle
          className={`size-6 transition-transform duration-300 ${
            isPending ? "animate-pulse" : "group-hover:rotate-12"
          }`}
          strokeWidth={2.2}
        />
      </button>
      <p className="text-xs text-muted-foreground">
        {isPending ? "공개 중..." : "오늘의 조각 공개하기"}
      </p>
    </div>
  );
}
