-- Tessera 초기 스키마
-- profiles: auth.users 1:1, github_usernames: 잔디 집계 대상(토큰 없음, 문자열만),
-- quarters/puzzle_pieces: 분기별 퍼즐, commit_days: GitHub 컨트리뷰션 캐시

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.github_usernames (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  unique (user_id, username)
);

create table public.quarters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  quarter smallint not null check (quarter between 1 and 4),
  photo_url text not null,
  grid_cols integer not null,
  grid_rows integer not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  unique (user_id, year, quarter)
);

create table public.puzzle_pieces (
  id uuid primary key default gen_random_uuid(),
  quarter_id uuid not null references public.quarters (id) on delete cascade,
  date date not null,
  piece_index integer not null,
  revealed boolean not null default false,
  revealed_at timestamptz,
  unique (quarter_id, date)
);

create table public.commit_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  count integer not null default 0,
  synced_at timestamptz not null default now(),
  unique (user_id, date)
);

-- RLS: 모든 데이터는 소유자 본인만 접근. puzzle_pieces는 quarters를 거쳐 소유자를 판별한다.

alter table public.profiles enable row level security;
alter table public.github_usernames enable row level security;
alter table public.quarters enable row level security;
alter table public.puzzle_pieces enable row level security;
alter table public.commit_days enable row level security;

create policy "본인 프로필만 조회/수정" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "본인 github_usernames만 접근" on public.github_usernames
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "본인 quarters만 접근" on public.quarters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "본인 puzzle_pieces만 접근" on public.puzzle_pieces
  for all using (
    exists (
      select 1 from public.quarters
      where quarters.id = puzzle_pieces.quarter_id
        and quarters.user_id = auth.uid()
    )
  );

create policy "본인 commit_days만 접근" on public.commit_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 신규 GitHub OAuth 로그인 시 profiles row 자동 생성
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'preferred_username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
