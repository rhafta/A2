"use client";

import { useEffect, useRef, useTransition } from "react";
import confetti from "canvas-confetti";
import { Puzzle, Check } from "lucide-react";
import { revealToday } from "@/app/dashboard/actions";

const CONFETTI_COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fffbeb"];
const CONFETTI_DURATION_MS = 3000;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function RevealTodayButton({ revealed }: { revealed: boolean }) {
  const [isPending, startTransition] = useTransition();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, []);

  // 앱의 앰버 브랜드 팔레트로, 화면 전체를 덮도록 좌우 가장자리에서 몇 초간 쏘아 올리고
  // 중력을 낮춰 천천히 떨어지는 느낌을 준다 (canvas-confetti 공식 "realistic" 예제 응용).
  function fireConfetti() {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);

    const defaults = {
      colors: CONFETTI_COLORS,
      startVelocity: 35,
      spread: 360,
      ticks: 500,
      gravity: 0.5,
      scalar: 1.2,
      disableForReducedMotion: true,
    };

    confetti({ ...defaults, particleCount: 130, origin: { x: 0.5, y: 0.5 } });

    const animationEnd = Date.now() + CONFETTI_DURATION_MS;
    intervalRef.current = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }
      const particleCount = 60 * (timeLeft / CONFETTI_DURATION_MS);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() * 0.4 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() * 0.4 } });
    }, 250);
  }

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
