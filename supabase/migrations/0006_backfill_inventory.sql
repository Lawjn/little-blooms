-- Backfill user_inventory cho users đã signup trước khi có trigger handle_new_user.
-- Idempotent: insert only nếu chưa có row.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

insert into public.user_inventory (user_id)
select id from public.profiles
where id not in (select user_id from public.user_inventory)
on conflict (user_id) do nothing;

-- Verify
select 'user_inventory rows:' as info;
select count(*) as total from public.user_inventory;
select 'profiles rows:' as info;
select count(*) as total from public.profiles;
