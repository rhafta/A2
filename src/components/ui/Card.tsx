import type { ReactNode } from "react";

/** 퍼즐/잔디/설정 패널이 공유하는 카드 표면 — 반복되는 표면 스타일을 한 곳에서 관리 */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-lg shadow-black/5 dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}
