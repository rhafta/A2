"use client";

import { PuzzlePiece } from "@/components/puzzle/PuzzlePiece";
import { getPieceGridPosition } from "@/lib/puzzle-piece";
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
  // 분기 일수가 grid 칸 수(gridCols x gridRows)에 딱 맞아떨어지지 않으면 마지막 줄은
  // 왼쪽부터 채워지고 오른쪽이 비어 어색해진다. 마지막 줄만 가운데로 밀어 대칭을 맞춘다.
  const lastRow = gridRows - 1;
  const lastRowCount = pieces.length - lastRow * gridCols;

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {pieces.map((piece) => {
        const { row, col } = getPieceGridPosition(piece.pieceIndex, gridCols);
        const rowCount = row === lastRow ? lastRowCount : gridCols;
        const centerOffset = Math.floor((gridCols - rowCount) / 2);

        return (
          <div
            key={piece.date}
            style={{ gridColumn: col + centerOffset + 1, gridRow: row + 1 }}
          >
            <PuzzlePiece
              photoUrl={photoUrl}
              gridCols={gridCols}
              gridRows={gridRows}
              pieceIndex={piece.pieceIndex}
              revealed={piece.revealed}
              highlighted={hoveredDate === piece.date}
              onHoverChange={(hovering) => setHoveredDate(hovering ? piece.date : null)}
            />
          </div>
        );
      })}
    </div>
  );
}
