import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function navLinkClass(isActive: boolean) {
  return `whitespace-nowrap rounded-md px-2 py-1.5 text-xs transition-colors sm:px-3 sm:text-sm ${
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;
}

/** 대시보드/갤러리/설정 페이지가 공유하는 상단 바 */
export function AppHeader({ active }: { active?: "gallery" | "github" }) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            T
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
            Tessera
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <Link href="/dashboard/gallery" className={navLinkClass(active === "gallery")}>
            갤러리
          </Link>
          <Link href="/settings/github" className={navLinkClass(active === "github")}>
            GitHub 연동
          </Link>
          <form action={signOut}>
            <button type="submit" className={navLinkClass(false)}>
              로그아웃
            </button>
          </form>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
