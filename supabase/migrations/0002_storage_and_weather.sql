-- Phase 2 — Storage buckets + chuyển weather text → text[]
-- Apply: Supabase Dashboard → SQL Editor → paste & Run

-- ============================================================================
-- mood_entries.weather: text → text[]
-- ============================================================================
-- Hiện tại weather là text (single value). UX cho phép multi-select (Sunny + Windy)
-- nên đổi sang text[] để consistent với các tag arrays khác.
alter table public.mood_entries
  alter column weather drop default;

alter table public.mood_entries
  alter column weather type text[]
  using case
    when weather is null or weather = '' then array[]::text[]
    else array[weather]
  end;

alter table public.mood_entries
  alter column weather set default '{}'::text[];

alter table public.mood_entries
  alter column weather set not null;

-- ============================================================================
-- Storage bucket: mood-photos (private)
-- ============================================================================
-- Path: {user_id}/{entry_date}/{idx}.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mood-photos',
  'mood-photos',
  false,
  10 * 1024 * 1024,                       -- 10MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS: user chỉ access path bắt đầu bằng user_id của mình
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
-- Storage bucket: avatars (public read)
-- ============================================================================
-- Phase 7 sẽ dùng. Tạo sẵn để khỏi tạo lại migration.
-- Path: {user_id}.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5 * 1024 * 1024,                        -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
