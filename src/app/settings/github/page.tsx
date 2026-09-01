import { redirect } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addGithubUsername, removeGithubUsername } from "@/app/settings/github/actions";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { Card } from "@/components/ui/Card";
import { GithubMark } from "@/components/icons/GithubMark";

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
    <div className="flex min-h-screen flex-col">
      <AppHeader active="github" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">GitHub 잔디 연동</h1>
          <p className="mt-1 text-sm text-zinc-500">
            잔디에 합산할 GitHub 사용자명을 등록하세요. 비공개 기여까지 반영하려면 각 계정의
            GitHub 설정 → Profile → &quot;Include private contributions on my
            profile&quot;을 켜두면 됩니다.
          </p>
        </div>

        <Card className="p-5 sm:p-6">
          <form action={addGithubUsername} className="flex gap-2">
            <input
              type="text"
              name="username"
              placeholder="GitHub 사용자명"
              required
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-400/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 active:scale-[0.98]"
            >
              추가
            </button>
          </form>

          <ul className="mt-4 flex flex-col gap-2">
            {(usernames ?? []).map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200"
              >
                <span className="flex items-center gap-2">
                  <GithubMark className="size-3.5 text-zinc-500" />
                  {u.username}
                </span>
                <form action={removeGithubUsername.bind(null, u.id)}>
                  <button
                    type="submit"
                    aria-label={`${u.username} 삭제`}
                    className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-red-400"
                  >
                    <X className="size-3.5" />
                  </button>
                </form>
              </li>
            ))}
            {(usernames ?? []).length === 0 && (
              <li className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-sm text-zinc-600">
                아직 등록된 계정이 없습니다.
              </li>
            )}
          </ul>
        </Card>
      </main>
    </div>
  );
}
