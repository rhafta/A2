"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getPieceCropStyle } from "@/lib/puzzle-piece";
import { formatKoreanDate } from "@/lib/quarter";

interface PuzzlePieceProps {
  photoUrl: string;
  gridCols: number;
  gridRows: number;
  row: number;
  col: number;
  date: string;
  revealed: boolean;
  /** 지나간 날짜인데 공개하지 못해 앞으로도 채울 수 없는 조각 */
  missed?: boolean;
  highlighted?: boolean;
  onHoverChange?: (hovering: boolean) => void;
}

/**
 * 현재는 격자 크롭 방식 하나만 구현되어 있다. 좌표 계산(getPieceCropStyle)과
 * 렌더링을 분리해 둔 덕분에, 나중에 실제 직소 모양이 필요해지면 이 컴포넌트 내부만
 * SVG clipPath 방식으로 교체하면 되고 호출부(PuzzleGrid)와 데이터 모델은 그대로 유지된다.
 * row/col은 PuzzleGrid가 계산한 실제 화면 배치 좌표를 그대로 받는다 — 크롭 위치와
 * 배치 위치가 반드시 같은 값에서 나와야 사진이 제자리에 복원된다.
 */
export function PuzzlePiece({
  photoUrl,
  gridCols,
  gridRows,
  row,
  col,
  date,
  revealed,
  missed = false,
  highlighted = false,
  onHoverChange,
}: PuzzlePieceProps) {
  const cropStyle = getPieceCropStyle(row, col, gridCols, gridRows);

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

  // 놓친 조각의 hover 툴팁은 잔디와 무관하게 이 컴포넌트 안에서만 필요해서
  // (미공개 조각은 HoveredDateContext와 연동하지 않는 규칙, 위 PuzzleGrid 참고) 로컬 상태로 둔다.
  const [isHovering, setIsHovering] = useState(false);
  const handleHoverChange = (hovering: boolean) => {
    setIsHovering(hovering);
    onHoverChange?.(hovering);
  };

  return (
    <div className="relative">
      {missed && isHovering && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md"
        >
          {formatKoreanDate(date)} · 놓쳐서 채우지 못했어요
        </div>
      )}
      <div
        role="img"
        aria-label={
          revealed
            ? "공개된 퍼즐 조각"
            : missed
              ? "놓쳐서 채우지 못한 퍼즐 조각"
              : "아직 공개되지 않은 퍼즐 조각"
        }
        tabIndex={0}
        onMouseEnter={() => handleHoverChange(true)}
        onMouseLeave={() => handleHoverChange(false)}
        onFocus={() => handleHoverChange(true)}
        onBlur={() => handleHoverChange(false)}
        className={`relative aspect-square overflow-hidden rounded-sm outline-none transition-[outline-color] duration-300 ${
          highlighted ? "outline outline-2 outline-accent" : "outline outline-2 outline-transparent"
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
            느낌을 준다(과한 컨페티 없이 절제된 리빌 피드백). 처음엔 라이트/다크 무관하게
            고정된 짙은 색을 썼는데, 실제로 렌더해보니 라이트 테마에서 새까만 사각형이
            "깨진 이미지"처럼 보여 테마별 --veil 토큰(라이트: 짙은 종이색, 다크: 거의
            검정)으로 바꿨다 — 두 테마 모두 사진을 충분히 가리면서도 "덮여있다"는 느낌을
            유지한다. (bg-cover는 Tailwind 내장 background-size 유틸과 이름이 겹쳐 피함) */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-veil/95 transition-opacity duration-300 ease-out ${
            revealed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        />

        {/* 놓친 조각: 미래/오늘처럼 언젠가 채울 수 있는 미공개 조각과 구분되게 ✕로 표시 */}
        {missed && (
          <div aria-hidden className="absolute inset-0 flex items-center justify-center">
            <X className="size-1/3 text-muted-foreground/70" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
}
