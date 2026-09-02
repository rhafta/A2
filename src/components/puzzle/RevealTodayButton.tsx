"use client";

import { useTransition } from "react";
import confetti from "canvas-confetti";
import { Puzzle, Check } from "lucide-react";
import { revealToday } from "@/app/dashboard/actions";

const CONFETTI_COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fffbeb"];

// 앱의 앰버 브랜드 팔레트로, 화면 전체를 한 번에 채우는 화려한 단발성 폭죽을 터뜨린다.
// 중앙 폭발 + 좌우 대포를 같은 순간에 동시 발사해 "한 번의 큰 이벤트"로 보이게 하고,
// 중력을 낮춰 화면을 채운 색종이가 천천히 떨어지게 한다.
function fireConfetti() {
  const shared = {
    colors: CONFETTI_COLORS,
    gravity: 0.55,
    scalar: 1.3,
    ticks: 450,
    disableForReducedMotion: true,
  };

  confetti({ ...shared, particleCount: 220, spread: 360, startVelocity: 48, origin: { x: 0.5, y: 0.5 } });
  confetti({ ...shared, particleCount: 140, angle: 60, spread: 80, startVelocity: 75, origin: { x: 0, y: 0.65 } });
  confetti({ ...shared, particleCount: 140, angle: 120, spread: 80, startVelocity: 75, origin: { x: 1, y: 0.65 } });
  confetti({ ...shared, particleCount: 90, angle: 260, spread: 100, startVelocity: 55, origin: { x: 0.15, y: 0 } });
  confetti({ ...shared, particleCount: 90, angle: 280, spread: 100, startVelocity: 55, origin: { x: 0.85, y: 0 } });
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
