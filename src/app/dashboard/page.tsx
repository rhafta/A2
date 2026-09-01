import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentQuarter, getQuarterDates, todayUTCDateString } from "@/lib/quarter";
import { getCommitDaysForQuarter, syncCommitDaysIfStale } from "@/lib/commit-sync";
import { NewQuarterUpload } from "@/components/puzzle/NewQuarterUpload";
import { PuzzleGrid } from "@/components/puzzle/PuzzleGrid";
import { RevealTodayButton } from "@/components/puzzle/RevealTodayButton";
import { CommitGrass } from "@/components/grass/CommitGrass";
import { HoveredDateProvider } from "@/components/dashboard/HoveredDateContext";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { Card } from "@/components/ui/Card";

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
  let hasGithubUsernames = false;
  if (!needsNewQuarter) {
    const { count } = await supabase
      .from("github_usernames")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    hasGithubUsernames = (count ?? 0) > 0;

    await syncCommitDaysIfStale(supabase, user.id, current);
    const commitMap = await getCommitDaysForQuarter(supabase, user.id, current);
    commitCounts = Array.from(commitMap, ([date, count]) => ({ date, count }));
  }

  const revealedCount = pieces.filter((p) => p.revealed).length;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        {needsNewQuarter || !photoUrl || !activeQuarter ? (
          <Card className="p-8">
            <NewQuarterUpload userId={user.id} year={current.year} quarter={current.quarter} />
          </Card>
        ) : (
          <HoveredDateProvider>
            <Card className="overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
                    {current.year}년 {current.quarter}분기 퍼즐
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {revealedCount}/{pieces.length} 조각 공개됨
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
                  <PuzzleGrid
                    photoUrl={photoUrl}
                    gridCols={activeQuarter.grid_cols}
                    gridRows={activeQuarter.grid_rows}
                    pieces={pieces}
                  />
                </div>
              </div>
              <div className="border-t border-white/10 bg-white/[0.02] py-5">
                <RevealTodayButton
                  revealed={pieces.find((p) => p.date === todayUTCDateString())?.revealed ?? false}
                />
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-200">커밋 잔디</h2>
                <p className="mt-0.5 text-xs text-zinc-500">연동된 GitHub 계정의 컨트리뷰션 합산</p>
              </div>
              <CommitGrass quarterDates={getQuarterDates(current)} counts={commitCounts} />
              {!hasGithubUsernames && (
                <p className="mt-3 text-xs text-zinc-500">
                  아직 연동된 GitHub 계정이 없습니다.{" "}
                  <Link href="/settings/github" className="text-amber-400 hover:underline">
                    사용자명을 등록
                  </Link>
                  하면 잔디가 채워집니다.
                </p>
              )}
            </Card>
          </HoveredDateProvider>
        )}
      </main>
    </div>
  );
}
