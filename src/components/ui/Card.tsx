import type { ReactNode } from "react";

/** 퍼즐/잔디/설정 패널이 공유하는 카드 표면 — 반복되는 표면 스타일을 한 곳에서 관리 */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-zinc-900/60 shadow-lg shadow-black/20 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
