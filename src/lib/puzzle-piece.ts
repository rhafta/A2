import type { CSSProperties } from "react";

/**
 * 조각 수(pieceCount)가 grid 칸 수(gridCols x gridRows)에 딱 안 맞으면 남는 칸이 생긴다.
 * 이 남는 칸을 전부 맨 아랫줄에 몰아두면 좌우는 가운데 정렬해도 위/아래가 비대칭으로
 * 보인다. 맨 윗줄과 맨 아랫줄에 절반씩 나눠 비워서 좌우+상하 모두 대칭인 완만한
 * 모서리(챔퍼) 모양을 만든다 — 셔플로 이미 무작위 배정된 piece_index(0..pieceCount-1)를
 * 이 모양 안의 칸 하나에 1:1로 대응시킨다. 이 좌표가 화면상 배치 위치이자
 * 크롭 위치의 유일한 기준이라, 사진의 해당 위치가 항상 그 자리에 그대로 드러난다.
 */
export function getPiecePosition(
  pieceIndex: number,
  pieceCount: number,
  gridCols: number,
  gridRows: number,
): { row: number; col: number } {
  const leftover = gridCols * gridRows - pieceCount;
  const topLeftover = gridRows === 1 ? leftover : Math.floor(leftover / 2);
  const bottomLeftover = leftover - topLeftover;

  let remaining = pieceIndex;
  for (let row = 0; row < gridRows; row++) {
    const rowLeftover = row === 0 ? topLeftover : row === gridRows - 1 ? bottomLeftover : 0;
    const rowFilled = gridCols - rowLeftover;
    if (remaining < rowFilled) {
      return { row, col: remaining + Math.floor(rowLeftover / 2) };
    }
    remaining -= rowFilled;
  }
  // pieceIndex < pieceCount이면 항상 루프 안에서 반환되므로 도달하지 않는다.
  return { row: gridRows - 1, col: gridCols - 1 };
}

/** CSS 스프라이트 크롭 방식으로 원본 사진에서 해당 칸 영역만 보여주는 스타일 */
export function getPieceCropStyle(
  row: number,
  col: number,
  gridCols: number,
  gridRows: number,
): CSSProperties {
  const bgPosX = gridCols > 1 ? (col / (gridCols - 1)) * 100 : 0;
  const bgPosY = gridRows > 1 ? (row / (gridRows - 1)) * 100 : 0;

  return {
    backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
  };
}
