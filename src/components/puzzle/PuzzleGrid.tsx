"use client";

import { PuzzlePiece } from "@/components/puzzle/PuzzlePiece";
import { getPiecePosition } from "@/lib/puzzle-piece";
import { useHoveredDate } from "@/components/dashboard/HoveredDateContext";

export interface PuzzlePieceData {
  date: string;
  pieceIndex: number;
  revealed: boolean;
}

interface PuzzleGridProps {
  photoUrl: string;
  gridCols: number;
  gridRows: number;
  pieces: PuzzlePieceData[];
}

export function PuzzleGrid({ photoUrl, gridCols, gridRows, pieces }: PuzzleGridProps) {
  const { hoveredDate, setHoveredDate } = useHoveredDate();

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {pieces.map((piece) => {
        const { row, col } = getPiecePosition(piece.pieceIndex, pieces.length, gridCols, gridRows);

        // 미공개 조각의 날짜는 그리드 위치와 무관하게 무작위로 배정돼 있어(퍼즐의 핵심
        // 컨셉), hover 연동을 켜두면 "왜 엉뚱한 칸이 반응하지?"처럼 보인다. 공개된
        // 조각만 잔디와 하이라이트를 주고받는다.
        return (
          <div key={piece.date} style={{ gridColumn: col + 1, gridRow: row + 1 }}>
            <PuzzlePiece
              photoUrl={photoUrl}
              gridCols={gridCols}
              gridRows={gridRows}
              row={row}
              col={col}
              revealed={piece.revealed}
              highlighted={piece.revealed && hoveredDate === piece.date}
              onHoverChange={(hovering) => {
                if (!piece.revealed) return;
                setHoveredDate(hovering ? piece.date : null);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
