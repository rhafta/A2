import { signInWithGithub } from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Tessera</h1>
        <p className="mt-2 text-sm opacity-70">
          매일 한 조각씩, 사진 퍼즐과 커밋 잔디를 함께 채워가세요.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          로그인에 실패했습니다. 다시 시도해 주세요.
        </p>
      )}

      <form action={signInWithGithub}>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          GitHub로 로그인
        </button>
      </form>
    </main>
  );
}
