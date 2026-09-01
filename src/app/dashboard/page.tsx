import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm opacity-70">{user?.email ?? user?.id}님, 환영합니다.</p>
      <form action={signOut}>
        <button type="submit" className="text-sm underline">
          로그아웃
        </button>
      </form>
    </main>
  );
}
