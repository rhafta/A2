"use client";

import { buildWeeks, getCommitLevel, getMonthLabels } from "@/lib/grass";
import { useHoveredDate } from "@/components/dashboard/HoveredDateContext";

const CELL_PX = 12;
const GAP_PX = 3;

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  // 0단계는 배경(zinc-950)과 너무 가까우면 "칸이 없는 것"처럼 보여 그리드가
  // 깨진 듯 보이므로, 빈 칸도 사각형으로 또렷이 읽히도록 한 단계 밝게 잡는다.
  0: "bg-zinc-700",
  1: "bg-green-900",
  2: "bg-green-700",
  3: "bg-green-500",
  4: "bg-green-400",
};

interface CommitGrassProps {
  quarterDates: string[];
  counts: { date: string; count: number }[];
}

export function CommitGrass({ quarterDates, counts }: CommitGrassProps) {
  const { hoveredDate, setHoveredDate } = useHoveredDate();
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
                className="absolute top-0 whitespace-nowrap text-[10px] text-zinc-500"
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

              return (
                <div
                  key={date}
                  role="img"
                  aria-label={`${date} 커밋 ${count}건`}
                  title={`${date} · 커밋 ${count}건`}
                  tabIndex={0}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onFocus={() => setHoveredDate(date)}
                  onBlur={() => setHoveredDate(null)}
                  className={`size-3 rounded-[2px] outline outline-2 transition-[outline-color] ${LEVEL_CLASS[level]} ${
                    hoveredDate === date ? "outline-amber-400" : "outline-transparent"
                  }`}
                />
              );
            }),
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-zinc-500">
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
