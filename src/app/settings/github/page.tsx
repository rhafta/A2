import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addGithubUsername, removeGithubUsername } from "@/app/settings/github/actions";

export default async function GithubSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: usernames } = await supabase
    .from("github_usernames")
    .select("id, username")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-lg font-semibold">GitHub 잔디 연동</h1>
        <p className="mt-2 text-sm opacity-70">
          잔디에 합산할 GitHub 사용자명을 등록하세요. 비공개 기여까지 반영하려면 각 계정의
          GitHub 설정 → Profile → &quot;Include private contributions on my
          profile&quot;을 켜두면 됩니다.
        </p>
      </div>

      <form action={addGithubUsername} className="flex gap-2">
        <input
          type="text"
          name="username"
          placeholder="GitHub 사용자명"
          required
          className="flex-1 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          추가
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(usernames ?? []).map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm"
          >
            <span>{u.username}</span>
            <form action={removeGithubUsername.bind(null, u.id)}>
              <button type="submit" className="text-xs underline opacity-70">
                삭제
              </button>
            </form>
          </li>
        ))}
        {(usernames ?? []).length === 0 && (
          <li className="text-sm opacity-50">아직 등록된 계정이 없습니다.</li>
        )}
      </ul>

      <Link href="/dashboard" className="text-sm underline opacity-70">
        대시보드로 돌아가기
      </Link>
    </main>
  );
}
