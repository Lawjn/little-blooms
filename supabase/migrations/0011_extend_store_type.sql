-- Fix: migration 0010 insert type='plant' bị reject vì check constraint cũ chỉ
-- allow seed_pack/theme/set/premium_pass. Extend constraint + reseed clean.
--
-- Idempotent: cleanup → recreate constraint → insert fresh.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

-- 1) Cleanup partial inserts từ 0010 nếu đã có (theo name unique)
delete from public.store_items
where name in (
  '100 Seeds', '500 Seeds', '1500 Seeds',
  'Sunflower', 'Tulip Pink', 'Cherry Blossom', 'Lucky Clover',
  'Bloom Premium'
);

-- 2) Drop + recreate check constraint với 'plant' added
alter table public.store_items
  drop constraint if exists store_items_type_check;

alter table public.store_items
  add constraint store_items_type_check
  check (type in ('seed_pack', 'theme', 'set', 'premium_pass', 'plant'));

-- 3) Re-insert clean
insert into public.store_items (type, name, description, price_vnd, metadata, display_order)
values
  -- Seed packs (fake IAP — buy seeds with money)
  ('seed_pack', '100 Seeds', 'Starter pack', 23000,
    '{"seeds_count": 100}'::jsonb, 1),
  ('seed_pack', '500 Seeds', 'Best value', 99000,
    '{"seeds_count": 500, "bonus": 50}'::jsonb, 2),
  ('seed_pack', '1500 Seeds', 'Power user', 250000,
    '{"seeds_count": 1500, "bonus": 250}'::jsonb, 3),

  -- Plants (unlock with seeds, FREE earned path)
  ('plant', 'Sunflower', 'Loài hoa mặt trời', 0,
    '{"plant_type": "sunflower", "seeds_cost": 100}'::jsonb, 10),
  ('plant', 'Tulip Pink', 'Tulip hồng pastel', 0,
    '{"plant_type": "rose", "seeds_cost": 200}'::jsonb, 11),
  ('plant', 'Cherry Blossom', 'Hoa anh đào', 0,
    '{"plant_type": "cherry", "seeds_cost": 300}'::jsonb, 12),
  ('plant', 'Lucky Clover', 'Cỏ ba lá may mắn', 0,
    '{"plant_type": "clover", "seeds_cost": 150}'::jsonb, 13),

  -- Premium subscription (fake $$)
  ('premium_pass', 'Bloom Premium', 'AI insights + Export data + Cloud backup',
    119000, '{"period": "monthly"}'::jsonb, 100);

-- Verify
select 'store_items count by type:' as info;
select type, count(*) as count
from public.store_items
group by type
order by type;

select 'All store_items:' as info;
select type, name, price_vnd, metadata, display_order
from public.store_items
order by display_order;
