"use client";

import { buildWeeks, getCommitLevel, getMonthLabels } from "@/lib/grass";
import { todayUTCDateString } from "@/lib/quarter";
import { useHoveredDate } from "@/components/dashboard/HoveredDateContext";

function formatTooltipDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("ko-KR", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
  });
}

const CELL_PX = 12;
const GAP_PX = 3;

// GitHub의 초록 잔디를 그대로 베끼면 "개발자 대시보드" 느낌이 짙어져서, 앱의 앰버
// 브랜드 컬러를 그대로 쓰는 온도감 있는 스케일로 바꿨다. 라이트에서는 진할수록,
// 다크에서는 밝을수록 활동량이 많다는 동일한 관례를 유지한다.
const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-amber-200 dark:bg-amber-900",
  2: "bg-amber-300 dark:bg-amber-700",
  3: "bg-amber-500 dark:bg-amber-500",
  4: "bg-amber-700 dark:bg-amber-400",
};

interface CommitGrassProps {
  quarterDates: string[];
  counts: { date: string; count: number }[];
}

export function CommitGrass({ quarterDates, counts }: CommitGrassProps) {
  const { hoveredDate, setHoveredDate } = useHoveredDate();
  const today = todayUTCDateString();
  const countByDate = new Map(counts.map((c) => [c.date, c.count]));
  const maxCount = Math.max(0, ...counts.map((c) => c.count));
  const weeks = buildWeeks(quarterDates);
  const monthLabels = getMonthLabels(weeks);
  const columnStep = CELL_PX + GAP_PX;

  return (
    // 모바일 화면에서 주 수가 많아지면 넘치는 대신 가로 스크롤로 대응
    <div className="overflow-x-auto pb-1">
      <div className="w-max">
        <div className="relative mb-1 h-3.5" style={{ width: weeks.length * columnStep }}>
          {monthLabels.map((label, i) =>
            label ? (
              <span
                key={i}
                className="absolute top-0 whitespace-nowrap text-[10px] text-muted-foreground"
                style={{ left: i * columnStep }}
              >
                {label}
              </span>
            ) : null,
          )}
        </div>

        <div
          className="grid gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column" }}
        >
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              if (!date) {
                return <div key={`${weekIndex}-${dayIndex}`} className="size-3" aria-hidden />;
              }
              const count = countByDate.get(date) ?? 0;
              const level = getCommitLevel(count, maxCount);
              const isHovered = hoveredDate === date;

              return (
                <div key={date} className="relative">
                  {isHovered && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md"
                    >
                      {formatTooltipDate(date)} · 커밋 {count}건
                    </div>
                  )}
                  <div
                    role="img"
                    aria-label={`${date} 커밋 ${count}건`}
                    tabIndex={0}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onFocus={() => setHoveredDate(date)}
                    onBlur={() => setHoveredDate(null)}
                    onClick={() => setHoveredDate(date)}
                    className={`size-3 cursor-pointer rounded-[2px] outline outline-2 transition-[outline-color] ${LEVEL_CLASS[level]} ${
                      isHovered ? "outline-accent" : "outline-transparent"
                    } ${date === today ? "ring-2 ring-foreground/70" : ""}`}
                  />
                </div>
              );
            }),
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
          <span>적음</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <div key={level} className={`size-2.5 rounded-[2px] ${LEVEL_CLASS[level]}`} />
          ))}
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}
