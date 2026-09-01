"use client";

import { PuzzlePiece } from "@/components/puzzle/PuzzlePiece";
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
  const pieceByIndex = new Map(pieces.map((p) => [p.pieceIndex, p]));
  const cellCount = gridCols * gridRows;

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cellCount }, (_, i) => {
        const piece = pieceByIndex.get(i);
        // 분기 일수가 grid 칸 수보다 적을 때 남는 칸은 렌더링하지 않는다.
        if (!piece) return <div key={i} aria-hidden />;

        return (
          <PuzzlePiece
            key={piece.date}
            photoUrl={photoUrl}
            gridCols={gridCols}
            gridRows={gridRows}
            pieceIndex={i}
            revealed={piece.revealed}
            highlighted={hoveredDate === piece.date}
            onHoverChange={(hovering) => setHoveredDate(hovering ? piece.date : null)}
          />
        );
      })}
    </div>
  );
}
