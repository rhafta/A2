"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

/** next-themes는 마운트 전엔 서버/클라이언트 테마가 다를 수 있어, 하이드레이션 이후에만
 * 아이콘을 그려야 한다. setState-in-effect 대신 useSyncExternalStore로 처리한다. */
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();

  return (
    <button
      type="button"
      aria-label="테마 전환"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {hasMounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
