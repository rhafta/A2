import { redirect } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { Card } from "@/components/ui/Card";

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
    <div className="flex min-h-screen flex-col">
      <AppHeader active="gallery" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="text-lg font-semibold text-zinc-100">지난 분기 갤러리</h1>

        {withThumbnails.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <ImageIcon className="size-6 text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">아직 보관된 분기가 없습니다.</p>
          </Card>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {withThumbnails.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/dashboard/gallery/${q.id}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-white/20"
                >
                  {q.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase 서명 URL은 요청마다 호스트가 달라 next/image remotePatterns로 고정할 수 없음
                    <img
                      src={q.thumbnailUrl}
                      alt={`${q.year}년 ${q.quarter}분기`}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <p className="px-3 py-2 text-xs font-medium text-zinc-300 group-hover:text-zinc-100">
                    {q.year}년 {q.quarter}분기
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
