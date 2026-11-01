-- ============================================================================
-- Effectcraft — profile bootstrap
-- Migration: 0003_profile_bootstrap
--
-- Depends on:
--   0001_effectcraft_core_schema.sql
--   0002_rls_and_storage.sql
--
-- Supabase Auth owns auth.users, while application data lives in
-- public.profiles. This migration creates a profile row for every new auth
-- user and backfills profiles for users who already exist.
--
-- The function is SECURITY DEFINER because sign-up runs before the new user
-- has an application session and therefore cannot satisfy the profiles RLS
-- policies directly.
-- ============================================================================

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.email), ''),
      new.id::text || '@users.invalid'
    ),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

-- Trigger functions cannot be invoked directly through PostgREST, so the
-- default EXECUTE grant is safe and avoids runtime trigger permission issues.

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for accounts created before this trigger existed.
insert into public.profiles (id, email, role)
select
  id,
  coalesce(
    nullif(btrim(email), ''),
    id::text || '@users.invalid'
  ),
  'user'
from auth.users
on conflict do nothing;

commit;
