/** GitHub 컨트리뷰션 그래프처럼 일요일 시작 주 단위(7행 x N열)로 날짜를 묶는다 */
export function buildWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return [];

  const firstDayOfWeek = new Date(`${dates[0]}T00:00:00Z`).getUTCDay(); // 0 = 일요일
  const padded: (string | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...dates,
  ];
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

/** GitHub 그래프와 동일한 5단계(0~4) 커밋 강도 레벨 */
export function getCommitLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (maxCount <= 0) return 1;
  const ratio = count / maxCount;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}
