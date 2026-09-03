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

        return (
          <div key={piece.date} style={{ gridColumn: col + 1, gridRow: row + 1 }}>
            <PuzzlePiece
              photoUrl={photoUrl}
              gridCols={gridCols}
              gridRows={gridRows}
              row={row}
              col={col}
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
