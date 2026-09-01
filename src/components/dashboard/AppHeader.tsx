import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

function navLinkClass(isActive: boolean) {
  return `rounded-md px-3 py-1.5 text-sm transition-colors ${
    isActive
      ? "bg-white/10 text-zinc-100"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
  }`;
}

/** 대시보드/갤러리/설정 페이지가 공유하는 상단 바 */
export function AppHeader({ active }: { active?: "gallery" | "github" }) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-amber-400 text-sm font-bold text-zinc-950">
            T
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Tessera</span>
        </Link>
        <nav className="flex items-center gap-1">
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
        </nav>
      </div>
    </header>
  );
}
