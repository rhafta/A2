/** 퍼즐 공개 진행률 — "꾸준히 채워가는" 느낌을 시각적으로 강조 */
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
