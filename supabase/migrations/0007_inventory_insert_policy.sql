-- Fix: user_inventory thiếu INSERT policy → upsert fail "RLS violation"
-- Postgres UPSERT (INSERT ON CONFLICT DO UPDATE) cần cả INSERT + UPDATE policies,
-- kể cả khi conflict trigger UPDATE path. Migration 0001 chỉ có SELECT + UPDATE.
--
-- Idempotent — drop trước, tạo lại.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.

drop policy if exists "Users can insert own inventory" on public.user_inventory;

create policy "Users can insert own inventory"
  on public.user_inventory for insert
  with check (auth.uid() = user_id);

-- Verify
select 'user_inventory policies:' as info;
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'user_inventory'
order by policyname;
