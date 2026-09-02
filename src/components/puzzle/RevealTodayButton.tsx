"use client";

import { useTransition } from "react";
import confetti from "canvas-confetti";
import { Puzzle, Check } from "lucide-react";
import { revealToday } from "@/app/dashboard/actions";

// 앱의 앰버 브랜드 팔레트를 그대로 써서 흔한 무지개색 컨페티 대신 톤이 맞는 축하 효과를 낸다.
function fireConfetti() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 32,
    origin: { y: 0.7 },
    colors: ["#d97706", "#f59e0b", "#fbbf24", "#fffbeb"],
  });
}

export function RevealTodayButton({ revealed }: { revealed: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    fireConfetti();
    // 이미 공개된 조각이면 서버에 다시 반영하지 않고, 축하 효과만 다시 재생한다.
    if (!revealed) {
      startTransition(() => revealToday());
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={revealed ? "오늘의 조각 공개 효과 다시 보기" : "오늘의 조각 공개하기"}
        onClick={handleClick}
        disabled={isPending}
        className={`group flex size-14 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-60 ${
          revealed
            ? "border border-border bg-muted text-muted-foreground"
            : "bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40"
        }`}
      >
        {revealed ? (
          <Check className="size-6" strokeWidth={2.5} />
        ) : (
          <Puzzle
            className={`size-6 transition-transform duration-300 ${
              isPending ? "animate-pulse" : "group-hover:rotate-12"
            }`}
            strokeWidth={2.2}
          />
        )}
      </button>
      <p className="text-xs text-muted-foreground">
        {revealed ? "오늘 조각을 공개했습니다" : isPending ? "공개 중..." : "오늘의 조각 공개하기"}
      </p>
    </div>
  );
}
