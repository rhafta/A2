"use client";

import { useEffect, useRef, useState } from "react";
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

  // false -> true로 바뀌는 "이 순간"만 팝 애니메이션을 재생한다. 처음 로드부터
  // 이미 공개돼 있던 조각들은(prevRevealed가 처음부터 true) 재생하지 않는다.
  const prevRevealed = useRef(revealed);
  const [justRevealed, setJustRevealed] = useState(false);

  useEffect(() => {
    const wasRevealed = prevRevealed.current;
    prevRevealed.current = revealed;
    if (!wasRevealed && revealed) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 650);
      return () => clearTimeout(timer);
    }
  }, [revealed]);

  return (
    <div
      role="img"
      aria-label={revealed ? "공개된 퍼즐 조각" : "아직 공개되지 않은 퍼즐 조각"}
      tabIndex={0}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className={`relative aspect-square overflow-hidden rounded-sm outline-none transition-[outline-color] duration-300 ${
        highlighted ? "outline outline-2 outline-amber-400" : "outline outline-2 outline-transparent"
      }`}
    >
      {/* 크롭된 배경 이미지는 별도의 안쪽 레이어에 둔다. 실제로 렌더해보니, overflow-hidden +
          outline/box-shadow 계열 장식이 바뀌는 바깥 레이어와, transform: scale() + filter로
          움직이는 안쪽 레이어가 같은 요소에 있거나(혹은 바깥 장식이 리빌과 "동시에" 바뀌면)
          크로미움이 이미지 일부를 검게 잘못 합성하는 버그를 재현했다. 그래서 (1) 배경
          이미지와 애니메이션은 안쪽 레이어로 분리하고 (2) 리빌 순간에 바깥 outline/ring을
          추가로 바꾸지 않는다 — 팝 효과는 아래 keyframe 자체의 밝기/채도 플래시로 충분하다. */}
      <div
        className={`absolute inset-0 ${justRevealed ? "animate-piece-reveal" : ""}`}
        style={{ backgroundImage: `url(${photoUrl})`, ...cropStyle }}
      />

      {/* 오버레이를 항상 렌더링하고 opacity만 전환해, 공개될 때 사진이 서서히 드러나는
          느낌을 준다(과한 컨페티 없이 절제된 리빌 피드백). bg-black/70은 실제로 렌더해보니
          색이 선명한 사진에서 형태가 다 비쳐 보여 "미공개" 느낌이 안 살아 zinc-950/95로
          거의 다 가리되 완전 암전은 아니게 조정했다. */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-zinc-950/95 transition-opacity duration-300 ease-out ${
          revealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
