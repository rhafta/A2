"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  assignShuffledPieceIndices,
  getCurrentQuarter,
  getGridDimensions,
  getQuarterDates,
  todayUTCDateString,
} from "@/lib/quarter";

export async function startQuarter(photoPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const current = getCurrentQuarter();
  const dates = getQuarterDates(current);
  const { cols, rows } = getGridDimensions(dates.length);

  // 이전 활성 분기는 보관(archived)으로 전환하고, 새 분기를 활성화한다.
  await supabase
    .from("quarters")
    .update({ status: "archived" })
    .eq("user_id", user.id)
    .eq("status", "active");

  const { data: quarter, error } = await supabase
    .from("quarters")
    .insert({
      user_id: user.id,
      year: current.year,
      quarter: current.quarter,
      photo_url: photoPath,
      grid_cols: cols,
      grid_rows: rows,
    })
    .select()
    .single();

  if (error || !quarter) {
    throw new Error("분기를 시작하지 못했습니다.");
  }

  const pieceMap = assignShuffledPieceIndices(dates);
  const pieceRows = dates.map((date) => ({
    quarter_id: quarter.id,
    date,
    piece_index: pieceMap.get(date)!,
  }));

  const { error: pieceError } = await supabase
    .from("puzzle_pieces")
    .insert(pieceRows);

  if (pieceError) {
    throw new Error("퍼즐 조각을 생성하지 못했습니다.");
  }

  redirect("/dashboard");
}

export async function revealToday() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const current = getCurrentQuarter();
  const { data: quarter } = await supabase
    .from("quarters")
    .select("id, year, quarter")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (
    !quarter ||
    quarter.year !== current.year ||
    quarter.quarter !== current.quarter
  ) {
    throw new Error("이번 분기 퍼즐이 아직 시작되지 않았습니다.");
  }

  const today = todayUTCDateString();
  const { data: piece } = await supabase
    .from("puzzle_pieces")
    .select("id, revealed")
    .eq("quarter_id", quarter.id)
    .eq("date", today)
    .maybeSingle();

  if (!piece) {
    throw new Error("오늘 날짜의 조각을 찾을 수 없습니다.");
  }

  if (!piece.revealed) {
    await supabase
      .from("puzzle_pieces")
      .update({ revealed: true, revealed_at: new Date().toISOString() })
      .eq("id", piece.id);
  }

  revalidatePath("/dashboard");
}
