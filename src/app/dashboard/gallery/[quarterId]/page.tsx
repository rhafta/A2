import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getQuarterDates, type QuarterKey } from "@/lib/quarter";
import { getCommitDaysForQuarter } from "@/lib/commit-sync";
import { PuzzleGrid } from "@/components/puzzle/PuzzleGrid";
import { CommitGrass } from "@/components/grass/CommitGrass";
import { HoveredDateProvider } from "@/components/dashboard/HoveredDateContext";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function GalleryQuarterPage({
  params,
}: PageProps<"/dashboard/gallery/[quarterId]">) {
  const { quarterId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quarter } = await supabase
    .from("quarters")
    .select("*")
    .eq("id", quarterId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!quarter) notFound();

  const { data: signed } = await supabase.storage
    .from("quarter-photos")
    .createSignedUrl(quarter.photo_url, 3600);

  const { data: pieceRows } = await supabase
    .from("puzzle_pieces")
    .select("date, piece_index, revealed")
    .eq("quarter_id", quarter.id);

  const pieces = (pieceRows ?? []).map((p) => ({
    date: p.date,
    pieceIndex: p.piece_index,
    revealed: p.revealed,
  }));

  const quarterKey: QuarterKey = {
    year: quarter.year,
    quarter: quarter.quarter as 1 | 2 | 3 | 4,
  };
  const commitMap = await getCommitDaysForQuarter(supabase, user.id, quarterKey);
  const commitCounts = Array.from(commitMap, ([date, count]) => ({ date, count }));
  const revealedCount = pieces.filter((p) => p.revealed).length;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader active="gallery" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 lg:max-w-4xl">
        <Link
          href="/dashboard/gallery"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          갤러리로
        </Link>

        {signed?.signedUrl && (
          <HoveredDateProvider>
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[3fr_2fr] lg:items-start">
              <Card className="p-5 sm:p-6">
                <div className="mb-4">
                  <h1 className="text-sm font-semibold tracking-wide text-foreground">
                    {quarter.year}년 {quarter.quarter}분기
                  </h1>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {revealedCount}/{pieces.length} 조각 공개됨
                  </p>
                </div>
                <ProgressBar value={revealedCount} max={pieces.length} />
                <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-border">
                  <PuzzleGrid
                    photoUrl={signed.signedUrl}
                    gridCols={quarter.grid_cols}
                    gridRows={quarter.grid_rows}
                    pieces={pieces}
                  />
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground">커밋 잔디</h2>
                <CommitGrass quarterDates={getQuarterDates(quarterKey)} counts={commitCounts} />
              </Card>
            </div>
          </HoveredDateProvider>
        )}
      </main>
    </div>
  );
}
