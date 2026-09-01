import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchContributionCounts } from "@/lib/github";
import { getQuarterBounds, getQuarterDates, type QuarterKey } from "@/lib/quarter";
import type { Database } from "@/lib/supabase/types";

const SYNC_TTL_MS = 60 * 60 * 1000; // 1시간 — 대시보드 로드 시 온디맨드로만 갱신

/**
 * 등록된 GitHub 사용자명들의 공개 컨트리뷰션을 합산해 commit_days 캐시를 갱신한다.
 * 캐시가 최근(1시간 이내)에 갱신됐다면 아무것도 하지 않는다 — 별도 크론/Edge Function 없이
 * 대시보드 로드 시점에만 온디맨드로 동기화한다 (계획서의 단순화 원칙).
 */
export async function syncCommitDaysIfStale(
  supabase: SupabaseClient<Database>,
  userId: string,
  quarterKey: QuarterKey,
) {
  const dates = getQuarterDates(quarterKey);
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const { data: latest } = await supabase
    .from("commit_days")
    .select("synced_at")
    .eq("user_id", userId)
    .gte("date", firstDate)
    .lte("date", lastDate)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isStale =
    !latest || Date.now() - new Date(latest.synced_at).getTime() > SYNC_TTL_MS;
  if (!isStale) return;

  const { data: usernames } = await supabase
    .from("github_usernames")
    .select("username")
    .eq("user_id", userId);

  if (!usernames || usernames.length === 0) return;

  const { start, end } = getQuarterBounds(quarterKey);
  const totals = new Map<string, number>(dates.map((d) => [d, 0]));

  await Promise.all(
    usernames.map(async ({ username }) => {
      try {
        const counts = await fetchContributionCounts(username, start, end);
        for (const [date, count] of counts) {
          totals.set(date, (totals.get(date) ?? 0) + count);
        }
      } catch (err) {
        console.error(err);
      }
    }),
  );

  const now = new Date().toISOString();
  const rows = dates.map((date) => ({
    user_id: userId,
    date,
    count: totals.get(date) ?? 0,
    synced_at: now,
  }));

  await supabase.from("commit_days").upsert(rows, { onConflict: "user_id,date" });
}

export async function getCommitDaysForQuarter(
  supabase: SupabaseClient<Database>,
  userId: string,
  quarterKey: QuarterKey,
): Promise<Map<string, number>> {
  const dates = getQuarterDates(quarterKey);
  const { data } = await supabase
    .from("commit_days")
    .select("date, count")
    .eq("user_id", userId)
    .gte("date", dates[0])
    .lte("date", dates[dates.length - 1]);

  return new Map((data ?? []).map((row) => [row.date, row.count]));
}
