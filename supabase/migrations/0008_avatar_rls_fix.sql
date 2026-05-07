-- Fix: avatars RLS policies dùng `storage.filename(name)` trả về '{userId}.jpg' (có ext)
-- → không match `auth.uid()::text` → upload fail "row-level security policy".
--
-- Đổi sang folder pattern `{userId}/avatar.{ext}` — check `storage.foldername[1]`
-- consistent với mood-photos.
--
-- Idempotent.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

drop policy if exists "avatars: public read" on storage.objects;
drop policy if exists "avatars: users upload own" on storage.objects;
drop policy if exists "avatars: users update own" on storage.objects;
drop policy if exists "avatars: users delete own" on storage.objects;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: users upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: users update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: users delete own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify
select 'avatars policies:' as info;
select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like 'avatars:%'
order by policyname;
