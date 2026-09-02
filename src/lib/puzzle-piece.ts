import type { CSSProperties } from "react";

/**
 * 조각 인덱스를 그리드상의 (row, col)로 변환.
 * 렌더링 방식(직사각형 크롭 vs 향후 직소 모양)이 바뀌어도 이 좌표 계산은 재사용된다.
 */
export function getPieceGridPosition(pieceIndex: number, gridCols: number) {
  return {
    row: Math.floor(pieceIndex / gridCols),
    col: pieceIndex % gridCols,
  };
}

/** CSS 스프라이트 크롭 방식으로 원본 사진에서 해당 조각 영역만 보여주는 스타일 */
export function getPieceCropStyle(
  pieceIndex: number,
  gridCols: number,
  gridRows: number,
): CSSProperties {
  const { row, col } = getPieceGridPosition(pieceIndex, gridCols);
  const bgPosX = gridCols > 1 ? (col / (gridCols - 1)) * 100 : 0;
  const bgPosY = gridRows > 1 ? (row / (gridRows - 1)) * 100 : 0;

  return {
    backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
  };
}
