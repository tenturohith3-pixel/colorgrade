-- ============================================================================
-- Effectcraft — complete Supabase setup
--
-- Consolidated from:
--   0001_effectcraft_core_schema.sql
--   0002_rls_and_storage.sql
--   0003_profile_bootstrap.sql
--
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- It creates the schema, RLS policies, storage bucket, and profile bootstrap
-- trigger in one transaction.
--
-- IMPORTANT:
--   * Use this file OR the individual migration files, not both.
--   * After this succeeds, sign up at /login, then run the admin promotion
--     statement at the bottom with your email address.
-- ============================================================================

begin;

-- ============================================================================
-- 1. CORE SCHEMA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- One profile row per Supabase Auth user. Role is constrained to the two
-- supported values, and defaults to the least-privileged role.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null default 'user',
  created_at  timestamptz not null default now(),

  constraint profiles_role_check
    check (role in ('user', 'admin')),

  constraint profiles_email_not_blank
    check (length(btrim(email)) > 0)
);

-- Case-insensitive uniqueness for account emails.
create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

-- Fast lookup of administrator accounts.
create index if not exists profiles_admin_idx
  on public.profiles (id)
  where role = 'admin';

-- ----------------------------------------------------------------------------
-- plugins
-- The catalogue record. The actual binary lives outside PostgreSQL; file_path
-- stores the storage object path or a local private path.
-- ----------------------------------------------------------------------------
create table if not exists public.plugins (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  category    text not null,
  version     text not null default '1.0.0',
  image_path  text,
  file_path   text,
  status      text not null default 'draft',
  created_at  timestamptz not null default now(),

  constraint plugins_name_not_blank
    check (length(btrim(name)) > 0),

  constraint plugins_category_not_blank
    check (length(btrim(category)) > 0),

  constraint plugins_version_not_blank
    check (length(btrim(version)) > 0),

  constraint plugins_status_check
    check (status in ('draft', 'published', 'archived'))
);

-- General catalogue ordering and filtering.
create index if not exists plugins_status_created_at_idx
  on public.plugins (status, created_at desc);

create index if not exists plugins_category_idx
  on public.plugins (category);

create index if not exists plugins_created_at_idx
  on public.plugins (created_at desc);

-- Efficient public catalogue queries.
create index if not exists plugins_published_created_at_idx
  on public.plugins (created_at desc)
  where status = 'published';

-- Case-insensitive name lookup / sorting.
create index if not exists plugins_name_lower_idx
  on public.plugins (lower(name));

-- ----------------------------------------------------------------------------
-- downloads
-- Append-only download events. Used for real popularity analytics and for
-- showing users their own download history.
-- ----------------------------------------------------------------------------
create table if not exists public.downloads (
  id             uuid primary key default gen_random_uuid(),
  plugin_id      uuid not null references public.plugins (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  downloaded_at  timestamptz not null default now()
);

create index if not exists downloads_plugin_id_idx
  on public.downloads (plugin_id);

create index if not exists downloads_user_id_idx
  on public.downloads (user_id);

create index if not exists downloads_downloaded_at_idx
  on public.downloads (downloaded_at desc);

-- Popularity queries: count downloads for one plugin over time.
create index if not exists downloads_plugin_recent_idx
  on public.downloads (plugin_id, downloaded_at desc);

-- User history queries.
create index if not exists downloads_user_recent_idx
  on public.downloads (user_id, downloaded_at desc);

-- ----------------------------------------------------------------------------
-- bug_reports
-- A user-submitted report attached to a specific plugin. Status values match
-- the product workflow: open -> reviewing -> resolved.
-- ----------------------------------------------------------------------------
create table if not exists public.bug_reports (
  id          uuid primary key default gen_random_uuid(),
  plugin_id   uuid not null references public.plugins (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  description text not null,
  status      text not null default 'open',
  created_at  timestamptz not null default now(),

  constraint bug_reports_description_not_blank
    check (length(btrim(description)) > 0),

  constraint bug_reports_status_check
    check (status in ('open', 'reviewing', 'resolved'))
);

create index if not exists bug_reports_plugin_id_idx
  on public.bug_reports (plugin_id);

create index if not exists bug_reports_user_id_idx
  on public.bug_reports (user_id);

create index if not exists bug_reports_status_idx
  on public.bug_reports (status);

create index if not exists bug_reports_created_at_idx
  on public.bug_reports (created_at desc);

-- Admin queue: newest reports in each status.
create index if not exists bug_reports_status_recent_idx
  on public.bug_reports (status, created_at desc);

-- User report history.
create index if not exists bug_reports_user_recent_idx
  on public.bug_reports (user_id, created_at desc);

-- ============================================================================
-- 2. RLS AND STORAGE
-- ============================================================================

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

-- ============================================================================
-- 3. PROFILE BOOTSTRAP
-- ============================================================================

-- Supabase Auth owns auth.users, while application data lives in
-- public.profiles. This trigger creates a profile row for every new auth user.
--
-- The function is SECURITY DEFINER because sign-up runs before the new user
-- has an application session and therefore cannot satisfy the profiles RLS
-- policies directly.
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

-- ============================================================================
-- 4. FIRST ADMIN
-- ============================================================================
-- After the setup succeeds:
--   1. Start the app and sign up at http://localhost:3000/login
--   2. Uncomment the statement below, replace the email, and run it separately.
--
-- insert into public.profiles (id, email, role)
-- select id, email, 'admin'
-- from auth.users
-- where lower(email) = lower('YOUR_EMAIL@example.com')
-- on conflict (id) do update
--   set role = 'admin'
-- returning id, email, role;

select 'Effectcraft schema installed successfully' as status;

commit;
