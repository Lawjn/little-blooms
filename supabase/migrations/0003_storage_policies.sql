-- Phase 2 — Storage policies (chạy SAU khi 2 buckets `mood-photos` + `avatars` đã được tạo qua Dashboard UI)
-- Idempotent: drop trước, tạo lại — chạy nhiều lần OK.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run

-- ============================================================================
-- Drop existing policies (nếu có) để tránh conflict
-- ============================================================================
drop policy if exists "mood-photos: users read own" on storage.objects;
drop policy if exists "mood-photos: users upload own" on storage.objects;
drop policy if exists "mood-photos: users update own" on storage.objects;
drop policy if exists "mood-photos: users delete own" on storage.objects;

drop policy if exists "avatars: public read" on storage.objects;
drop policy if exists "avatars: users upload own" on storage.objects;
drop policy if exists "avatars: users update own" on storage.objects;
drop policy if exists "avatars: users delete own" on storage.objects;

-- ============================================================================
-- mood-photos (private, path = {user_id}/{date}/{idx}.jpg)
-- ============================================================================
create policy "mood-photos: users read own"
  on storage.objects for select
  using (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "mood-photos: users upload own"
  on storage.objects for insert
  with check (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "mood-photos: users update own"
  on storage.objects for update
  using (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "mood-photos: users delete own"
  on storage.objects for delete
  using (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- avatars (public read, path = {user_id}.jpg)
-- ============================================================================
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: users upload own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.filename(name)));

create policy "avatars: users update own"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.filename(name)))
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.filename(name)));

create policy "avatars: users delete own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.filename(name)));
