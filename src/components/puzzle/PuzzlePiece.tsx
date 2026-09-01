"use client";

import { getPieceCropStyle } from "@/lib/puzzle-piece";

interface PuzzlePieceProps {
  photoUrl: string;
  gridCols: number;
  gridRows: number;
  pieceIndex: number;
  revealed: boolean;
  highlighted?: boolean;
  onHoverChange?: (hovering: boolean) => void;
}

/**
 * 현재는 격자 크롭 방식 하나만 구현되어 있다. 좌표 계산(getPieceCropStyle)과
 * 렌더링을 분리해 둔 덕분에, 나중에 실제 직소 모양이 필요해지면 이 컴포넌트 내부만
 * SVG clipPath 방식으로 교체하면 되고 호출부(PuzzleGrid)와 데이터 모델은 그대로 유지된다.
 */
export function PuzzlePiece({
  photoUrl,
  gridCols,
  gridRows,
  pieceIndex,
  revealed,
  highlighted = false,
  onHoverChange,
}: PuzzlePieceProps) {
  const cropStyle = getPieceCropStyle(pieceIndex, gridCols, gridRows);

  return (
    <div
      role="img"
      aria-label={revealed ? "공개된 퍼즐 조각" : "아직 공개되지 않은 퍼즐 조각"}
      tabIndex={0}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className={`relative aspect-square overflow-hidden rounded-sm outline-none transition-[outline-color] ${
        highlighted ? "outline outline-2 outline-amber-400" : "outline outline-2 outline-transparent"
      }`}
      style={{ backgroundImage: `url(${photoUrl})`, ...cropStyle }}
    >
      {/* 오버레이를 항상 렌더링하고 opacity만 전환해, 공개될 때 사진이 서서히 드러나는
          느낌을 준다(과한 컨페티 없이 절제된 리빌 피드백). */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          revealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
