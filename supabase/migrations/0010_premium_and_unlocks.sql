-- Phase B: Premium subscription flag + plant ownership
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

-- 1) Add is_premium flag to profiles
alter table public.profiles
  add column if not exists is_premium boolean not null default false;

-- 2) Add owned_plants to user_inventory (default: chỉ tulip free)
alter table public.user_inventory
  add column if not exists owned_plants text[] not null default array['tulip']::text[];

-- 3) Seed store_items với 3 categories:
--    - seed_pack (buy seeds with $$)
--    - plant (unlock plant species with seeds)
--    - premium (subscription)
insert into public.store_items (id, type, name, description, price_vnd, metadata, display_order)
values
  -- Seed packs (fake IAP — buy seeds with money)
  (gen_random_uuid(), 'seed_pack', '100 Seeds', 'Starter pack', 23000,
    '{"seeds_count": 100}'::jsonb, 1),
  (gen_random_uuid(), 'seed_pack', '500 Seeds', 'Best value', 99000,
    '{"seeds_count": 500, "bonus": 50}'::jsonb, 2),
  (gen_random_uuid(), 'seed_pack', '1500 Seeds', 'Power user', 250000,
    '{"seeds_count": 1500, "bonus": 250}'::jsonb, 3),

  -- Plants (unlock with seeds, FREE earned path)
  (gen_random_uuid(), 'plant', 'Sunflower', 'Loài hoa mặt trời', 0,
    '{"plant_type": "sunflower", "seeds_cost": 100}'::jsonb, 10),
  (gen_random_uuid(), 'plant', 'Tulip Pink', 'Tulip hồng pastel', 0,
    '{"plant_type": "rose", "seeds_cost": 200}'::jsonb, 11),
  (gen_random_uuid(), 'plant', 'Cherry Blossom', 'Hoa anh đào', 0,
    '{"plant_type": "cherry", "seeds_cost": 300}'::jsonb, 12),
  (gen_random_uuid(), 'plant', 'Lucky Clover', 'Cỏ ba lá may mắn', 0,
    '{"plant_type": "clover", "seeds_cost": 150}'::jsonb, 13),

  -- Premium subscription (fake $$)
  (gen_random_uuid(), 'premium_pass', 'Bloom Premium', 'AI insights + Export data + Cloud backup', 119000,
    '{"period": "monthly"}'::jsonb, 100)
on conflict do nothing;

-- Verify
select 'profiles.is_premium added' as info;
select 'user_inventory.owned_plants added' as info;
select 'store_items seeded:' as info;
select type, name, price_vnd, metadata
from public.store_items
order by display_order;
