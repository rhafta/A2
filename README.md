# Tessera

매일 한 번 클릭하면 사진 퍼즐 조각이 무작위 위치에 하나씩 공개되는 습관 트래커. 퍼즐 아래엔 여러 GitHub 계정의 커밋을 통합한 잔디를 보여준다. 설계 배경은 `/root/.claude/plans/dreamy-stirring-newt.md` (계획서) 참고.

## 로컬 개발 설정

### 1. Supabase 프로젝트 준비

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/migrations/*.sql`을 순서대로 SQL Editor에서 실행 (또는 Supabase CLI로 `supabase db push`)
3. Authentication → Providers → GitHub 활성화
   - GitHub 쪽에서 OAuth App 생성 시 Authorization callback URL은 Supabase가 알려주는 `https://<project-ref>.supabase.co/auth/v1/callback`으로 등록
   - 발급받은 Client ID/Secret을 Supabase Provider 설정에 입력
4. Project Settings → API에서 Project URL과 anon key 확인

### 2. GitHub Personal Access Token 발급

`/settings/github`에서 등록한 사용자명들의 공개 컨트리뷰션을 서버가 대신 조회할 때 쓰는 앱 소유 토큰. 별도 scope 불필요(공개 데이터 조회만).

- github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens (또는 classic token, no scope)로 발급

### 3. 환경 변수

```bash
cp .env.local.example .env.local
```

`.env.local`에 Supabase URL/anon key, `GITHUB_PAT`를 채운다.

### 4. 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres/Auth/Storage)
