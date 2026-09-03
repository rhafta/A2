import { signInWithGithub, signInWithGoogle } from "@/app/login/actions";
import { Card } from "@/components/ui/Card";
import { GithubMark } from "@/components/icons/GithubMark";
import { GoogleMark } from "@/components/icons/GoogleMark";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl bg-accent text-lg font-bold text-accent-foreground">
          T
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Tessera</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          매일 한 조각씩, 사진 퍼즐과 커밋 잔디를 함께 채워가세요.
        </p>

        {error && (
          <p className="mt-5 text-sm text-red-500 dark:text-red-400">
            로그인에 실패했습니다. 다시 시도해 주세요.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          <form action={signInWithGithub}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.98]"
            >
              <GithubMark className="size-4" />
              GitHub로 로그인
            </button>
          </form>

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            >
              <GoogleMark className="size-4" />
              Google로 로그인
            </button>
          </form>
        </div>
      </Card>
    </main>
  );
}
