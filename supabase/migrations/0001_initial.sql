-- Little Blooms — Initial schema
-- Phase 0.7
--
-- Apply: copy SQL này paste vào Supabase Dashboard → SQL Editor → Run
-- Hoặc dùng Supabase CLI: `supabase db push`

-- ============================================================================
-- profiles
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  streak_count integer not null default 0,
  last_log_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile khi user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  insert into public.user_inventory (user_id) values (new.id);
  return new;
end;
$$;

-- ============================================================================
-- mood_entries
-- ============================================================================
create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  mood_level smallint not null check (mood_level between 1 and 5),
  emotions text[] not null default '{}',
  hobbies text[] not null default '{}',
  meals text[] not null default '{}',
  self_care text[] not null default '{}',
  weather text,
  other_tags text[] not null default '{}',
  note text,
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index idx_mood_entries_user_date on public.mood_entries (user_id, entry_date desc);

alter table public.mood_entries enable row level security;

create policy "Users can view own mood entries"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own mood entries"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mood entries"
  on public.mood_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own mood entries"
  on public.mood_entries for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- user_inventory
-- ============================================================================
create table public.user_inventory (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  seeds_balance integer not null default 0,
  owned_themes text[] not null default array['default']::text[],
  active_theme text not null default 'default',
  updated_at timestamptz not null default now()
);

alter table public.user_inventory enable row level security;

create policy "Users can view own inventory"
  on public.user_inventory for select
  using (auth.uid() = user_id);

create policy "Users can update own inventory"
  on public.user_inventory for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inventory insert chỉ qua trigger handle_new_user (không cho client insert tay)

-- ============================================================================
-- store_items
-- ============================================================================
create table public.store_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('seed_pack', 'theme', 'set', 'premium_pass')),
  name text not null,
  description text,
  price_vnd integer not null,
  product_id_ios text,
  product_id_android text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0
);

create index idx_store_items_active on public.store_items (is_active, display_order)
  where is_active = true;

alter table public.store_items enable row level security;

create policy "Anyone authenticated can view active store items"
  on public.store_items for select
  to authenticated
  using (is_active = true);

-- ============================================================================
-- purchases
-- ============================================================================
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  store_item_id uuid references public.store_items(id),
  platform text not null check (platform in ('ios', 'android')),
  receipt text not null,
  transaction_id text not null unique,
  amount_vnd integer not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_purchases_user on public.purchases (user_id, created_at desc);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can insert own pending purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Updates chỉ qua Edge Function `verify-iap` (service role)

-- ============================================================================
-- Trigger: tự update `updated_at` mỗi khi UPDATE
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger mood_entries_updated_at before update on public.mood_entries
  for each row execute function public.set_updated_at();

create trigger user_inventory_updated_at before update on public.user_inventory
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Trigger: tự tạo profile + inventory khi user signup
-- ============================================================================
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Storage buckets (chạy ở Dashboard → Storage manually nếu CLI không có)
-- ============================================================================
-- Bucket: mood-photos (private)
-- Bucket: avatars (public read)
--
-- Storage RLS:
-- mood-photos: user chỉ access path `{user_id}/...` của mình
-- avatars: public read, write chỉ owner
--
-- Sẽ viết bằng Storage SQL ở migration 0002 sau khi kiểm tra Supabase CLI version.
