import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuarterDates, type QuarterKey } from "@/lib/quarter";
import { getCommitDaysForQuarter } from "@/lib/commit-sync";
import { PuzzleGrid } from "@/components/puzzle/PuzzleGrid";
import { CommitGrass } from "@/components/grass/CommitGrass";
import { HoveredDateProvider } from "@/components/dashboard/HoveredDateContext";

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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {quarter.year}년 {quarter.quarter}분기
        </h1>
        <Link href="/dashboard/gallery" className="text-sm underline opacity-70">
          갤러리로
        </Link>
      </div>

      {signed?.signedUrl && (
        <HoveredDateProvider>
          <div className="space-y-8">
            <PuzzleGrid
              photoUrl={signed.signedUrl}
              gridCols={quarter.grid_cols}
              gridRows={quarter.grid_rows}
              pieces={pieces}
            />
            <CommitGrass quarterDates={getQuarterDates(quarterKey)} counts={commitCounts} />
          </div>
        </HoveredDateProvider>
      )}
    </main>
  );
}
