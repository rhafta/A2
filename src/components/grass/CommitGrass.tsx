"use client";

import { buildWeeks, getCommitLevel } from "@/lib/grass";
import { useHoveredDate } from "@/components/dashboard/HoveredDateContext";

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-zinc-800",
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

  return (
    // 모바일 화면에서 주 수가 많아지면 넘치는 대신 가로 스크롤로 대응
    <div className="overflow-x-auto pb-1">
      <div
        className="grid w-max gap-[3px]"
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
    </div>
  );
}
