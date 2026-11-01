-- ============================================================================
-- Effectcraft — RLS and Supabase Storage
-- Migration: 0002_rls_and_storage
--
-- Depends on:
--   0001_effectcraft_core_schema.sql
--
-- Security notes:
--   * Public users can only read published plugins.
--   * Admin checks are server-verified through public.is_admin().
--   * A trigger prevents non-admin users from promoting themselves by updating
--     their own profile row.
--   * Download events remain server-write-only; clients get read-only access
--     to their own history (and admins can read all).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Admin authorization helper
--
-- SECURITY DEFINER is required so RLS policies can inspect profiles without
-- recursively evaluating the profiles RLS policies. The empty search_path
-- prevents search-path hijacking.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- RLS cannot compare OLD vs NEW values, so this trigger blocks privilege
-- escalation through a normal profile update. Email remains editable; role,
-- id, and created_at are protected.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Profile id cannot be changed';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Profile created_at cannot be changed';
  end if;

  -- A null auth.uid() means this is a privileged database session (for
  -- example, the Supabase SQL editor or service role) rather than an
  -- end-user request. Allow that path so the first administrator can be
  -- bootstrapped. Normal authenticated users still cannot promote themselves.
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Only administrators can change profile roles';
  end if;

  return new;
end;
$$;

-- Trigger functions cannot be invoked directly through PostgREST, so the
-- default EXECUTE grant is safe and avoids runtime trigger permission issues.

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileges();

-- ----------------------------------------------------------------------------
-- plugins
-- ----------------------------------------------------------------------------
alter table public.plugins enable row level security;

drop policy if exists "plugins_public_read_published" on public.plugins;
create policy "plugins_public_read_published"
  on public.plugins
  for select
  to anon, authenticated
  using (status = 'published');

-- Admins need to read drafts and archived records in the dashboard.
drop policy if exists "plugins_admin_read_all" on public.plugins;
create policy "plugins_admin_read_all"
  on public.plugins
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "plugins_admin_insert" on public.plugins;
create policy "plugins_admin_insert"
  on public.plugins
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "plugins_admin_update" on public.plugins;
create policy "plugins_admin_update"
  on public.plugins
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "plugins_admin_delete" on public.plugins;
create policy "plugins_admin_delete"
  on public.plugins
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- bug_reports
-- ----------------------------------------------------------------------------
alter table public.bug_reports enable row level security;

drop policy if exists "bug_reports_insert_own" on public.bug_reports;
create policy "bug_reports_insert_own"
  on public.bug_reports
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "bug_reports_select_own" on public.bug_reports;
create policy "bug_reports_select_own"
  on public.bug_reports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "bug_reports_admin_select_all" on public.bug_reports;
create policy "bug_reports_admin_select_all"
  on public.bug_reports
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "bug_reports_admin_update_all" on public.bug_reports;
create policy "bug_reports_admin_update_all"
  on public.bug_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Users intentionally have no update or delete policy. Admins can update
-- status and metadata, but deletion is not exposed through RLS.

-- ----------------------------------------------------------------------------
-- downloads
-- ----------------------------------------------------------------------------
alter table public.downloads enable row level security;

-- Download rows are inserted by the server after authentication and a
-- published-asset check. Clients can read their own history but cannot create,
-- alter, or delete download events.
drop policy if exists "downloads_select_own" on public.downloads;
create policy "downloads_select_own"
  on public.downloads
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "downloads_admin_select_all" on public.downloads;
create policy "downloads_admin_select_all"
  on public.downloads
  for select
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Supabase Storage bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('plugin_assets', 'plugin_assets', true)
on conflict (id) do update
  set public = excluded.public;

-- Public read for the plugin_assets bucket.
drop policy if exists "plugin_assets_public_read" on storage.objects;
create policy "plugin_assets_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'plugin_assets');

-- Only administrators may create objects.
drop policy if exists "plugin_assets_admin_insert" on storage.objects;
create policy "plugin_assets_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'plugin_assets'
    and public.is_admin()
  );

-- Only administrators may replace/update objects.
drop policy if exists "plugin_assets_admin_update" on storage.objects;
create policy "plugin_assets_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'plugin_assets'
    and public.is_admin()
  )
  with check (
    bucket_id = 'plugin_assets'
    and public.is_admin()
  );

-- Only administrators may delete objects.
drop policy if exists "plugin_assets_admin_delete" on storage.objects;
create policy "plugin_assets_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'plugin_assets'
    and public.is_admin()
  );

commit;
