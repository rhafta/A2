-- 분기 사진 저장용 Storage 버킷. 경로 규칙: {user_id}/{quarter_id}.jpg
-- 퍼즐 사진은 로그인한 본인만 볼 이유가 없는 개인 습관 기록이지만, 소유자 판별을
-- 파일 경로의 첫 세그먼트(user_id)로 하므로 public read는 막고 소유자만 읽도록 제한한다.

insert into storage.buckets (id, name, public)
values ('quarter-photos', 'quarter-photos', false);

create policy "본인 폴더 사진만 업로드"
  on storage.objects for insert
  with check (
    bucket_id = 'quarter-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 폴더 사진만 조회"
  on storage.objects for select
  using (
    bucket_id = 'quarter-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 폴더 사진만 삭제"
  on storage.objects for delete
  using (
    bucket_id = 'quarter-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
