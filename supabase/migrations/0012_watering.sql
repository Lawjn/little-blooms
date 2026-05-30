-- Watering daily streak action — tưới cây mỗi ngày giữ streak.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

alter table public.user_inventory
  add column if not exists last_watered_date date;

alter table public.user_inventory
  add column if not exists water_streak integer not null default 0;

-- Verify
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'user_inventory'
  and column_name in ('last_watered_date', 'water_streak');
