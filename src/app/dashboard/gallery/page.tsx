import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function GalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quarters } = await supabase
    .from("quarters")
    .select("id, year, quarter, photo_url")
    .eq("user_id", user.id)
    .eq("status", "archived")
    .order("year", { ascending: false })
    .order("quarter", { ascending: false });

  const withThumbnails = await Promise.all(
    (quarters ?? []).map(async (q) => {
      const { data: signed } = await supabase.storage
        .from("quarter-photos")
        .createSignedUrl(q.photo_url, 3600);
      return { ...q, thumbnailUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">지난 분기 갤러리</h1>
        <Link href="/dashboard" className="text-sm underline opacity-70">
          대시보드로
        </Link>
      </div>

      {withThumbnails.length === 0 ? (
        <p className="text-sm opacity-50">아직 보관된 분기가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {withThumbnails.map((q) => (
            <li key={q.id}>
              <Link
                href={`/dashboard/gallery/${q.id}`}
                className="block overflow-hidden rounded-md border border-white/10 transition-transform hover:-translate-y-0.5"
              >
                {q.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase 서명 URL은 요청마다 호스트가 달라 next/image remotePatterns로 고정할 수 없음
                  <img
                    src={q.thumbnailUrl}
                    alt={`${q.year}년 ${q.quarter}분기`}
                    className="aspect-square w-full object-cover"
                  />
                )}
                <p className="px-2 py-1 text-xs opacity-70">
                  {q.year}년 {q.quarter}분기
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
