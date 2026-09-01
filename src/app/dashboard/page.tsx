import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentQuarter, getQuarterDates, todayUTCDateString } from "@/lib/quarter";
import { signOut } from "@/lib/actions/auth";
import { getCommitDaysForQuarter, syncCommitDaysIfStale } from "@/lib/commit-sync";
import { NewQuarterUpload } from "@/components/puzzle/NewQuarterUpload";
import { PuzzleGrid } from "@/components/puzzle/PuzzleGrid";
import { RevealTodayButton } from "@/components/puzzle/RevealTodayButton";
import { CommitGrass } from "@/components/grass/CommitGrass";
import { HoveredDateProvider } from "@/components/dashboard/HoveredDateContext";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const current = getCurrentQuarter();
  const { data: activeQuarter } = await supabase
    .from("quarters")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const needsNewQuarter =
    !activeQuarter ||
    activeQuarter.year !== current.year ||
    activeQuarter.quarter !== current.quarter;

  let photoUrl: string | null = null;
  let pieces: { date: string; pieceIndex: number; revealed: boolean }[] = [];

  if (!needsNewQuarter && activeQuarter) {
    const { data: signed } = await supabase.storage
      .from("quarter-photos")
      .createSignedUrl(activeQuarter.photo_url, 3600);
    photoUrl = signed?.signedUrl ?? null;

    const { data: pieceRows } = await supabase
      .from("puzzle_pieces")
      .select("date, piece_index, revealed")
      .eq("quarter_id", activeQuarter.id);

    pieces = (pieceRows ?? []).map((p) => ({
      date: p.date,
      pieceIndex: p.piece_index,
      revealed: p.revealed,
    }));
  }

  let commitCounts: { date: string; count: number }[] = [];
  if (!needsNewQuarter) {
    await syncCommitDaysIfStale(supabase, user.id, current);
    const commitMap = await getCommitDaysForQuarter(supabase, user.id, current);
    commitCounts = Array.from(commitMap, ([date, count]) => ({ date, count }));
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 py-12">
      <header className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-lg font-semibold">Tessera</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/gallery" className="text-sm underline opacity-70">
            갤러리
          </Link>
          <Link href="/settings/github" className="text-sm underline opacity-70">
            GitHub 연동
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm underline opacity-70">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {needsNewQuarter || !photoUrl || !activeQuarter ? (
        <NewQuarterUpload userId={user.id} year={current.year} quarter={current.quarter} />
      ) : (
        <HoveredDateProvider>
          <div className="w-full max-w-2xl space-y-8">
            <PuzzleGrid
              photoUrl={photoUrl}
              gridCols={activeQuarter.grid_cols}
              gridRows={activeQuarter.grid_rows}
              pieces={pieces}
            />
            <RevealTodayButton
              revealed={pieces.find((p) => p.date === todayUTCDateString())?.revealed ?? false}
            />
            <CommitGrass quarterDates={getQuarterDates(current)} counts={commitCounts} />
          </div>
        </HoveredDateProvider>
      )}
    </main>
  );
}
