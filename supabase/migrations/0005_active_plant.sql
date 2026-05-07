-- Quick wins: add active_plant cho user_inventory để user chọn loài cây cho vườn.
-- Idempotent. Apply: Supabase Dashboard → SQL Editor → paste & Run.

alter table public.user_inventory
  add column if not exists active_plant text not null default 'tulip';

-- Constraint check valid plant types (match PlantType trong app)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_inventory_active_plant_check'
  ) then
    alter table public.user_inventory
      add constraint user_inventory_active_plant_check
      check (active_plant in ('tulip', 'sunflower', 'rose', 'cherry', 'clover'));
  end if;
end $$;

-- Verify
select 'user_inventory schema:' as info;
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'user_inventory'
order by ordinal_position;
