"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface HoveredDateContextValue {
  hoveredDate: string | null;
  setHoveredDate: (date: string | null) => void;
}

const HoveredDateContext = createContext<HoveredDateContextValue | null>(null);

/** 퍼즐 조각과 잔디 셀이 같은 날짜 hover 상태를 공유하기 위한 Context */
export function HoveredDateProvider({ children }: { children: ReactNode }) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  return (
    <HoveredDateContext.Provider value={{ hoveredDate, setHoveredDate }}>
      {children}
    </HoveredDateContext.Provider>
  );
}

export function useHoveredDate() {
  const ctx = useContext(HoveredDateContext);
  if (!ctx) {
    throw new Error("useHoveredDate는 HoveredDateProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
