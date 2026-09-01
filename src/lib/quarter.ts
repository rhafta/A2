// 분기(달력 기준) 계산과 퍼즐 그리드 배정 로직.
// 리빌은 UTC 자정 기준 "하루"로 판정한다 (계획서에 명시된 단순화 가정).

export interface QuarterKey {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

export function getCurrentQuarter(now: Date = new Date()): QuarterKey {
  const year = now.getUTCFullYear();
  const quarter = (Math.floor(now.getUTCMonth() / 3) + 1) as QuarterKey["quarter"];
  return { year, quarter };
}

export function todayUTCDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** 분기의 시작일과 다음 분기 시작일(exclusive) — 둘 다 UTC 자정 */
export function getQuarterBounds({ year, quarter }: QuarterKey): {
  start: Date;
  end: Date;
} {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = new Date(Date.UTC(year, startMonth + 3, 1));
  return { start, end };
}

/** 분기에 속한 모든 날짜를 YYYY-MM-DD 문자열로 반환 (90~92개) */
export function getQuarterDates(key: QuarterKey): string[] {
  const { start, end } = getQuarterBounds(key);
  const dates: string[] = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 10열 고정, 남는 셀은 화면에서 숨김 처리 (계획서 가정) */
export function getGridDimensions(pieceCount: number): {
  cols: number;
  rows: number;
} {
  const cols = 10;
  const rows = Math.ceil(pieceCount / cols);
  return { cols, rows };
}

/**
 * 분기의 각 날짜에 무작위 조각 인덱스를 1:1로 배정한다.
 * Fisher-Yates 셔플로 piece_index 배열을 섞은 뒤 날짜 순서대로 짝짓는다.
 */
export function assignShuffledPieceIndices(dates: string[]): Map<string, number> {
  const indices = Array.from({ length: dates.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Map(dates.map((date, i) => [date, indices[i]]));
}
