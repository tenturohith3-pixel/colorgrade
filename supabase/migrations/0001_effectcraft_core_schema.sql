-- ============================================================================
-- Effectcraft — core PostgreSQL schema
-- Migration: 0001_effectcraft_core_schema
--
-- Creates the core catalogue, account, download, and bug-report tables.
-- Row Level Security is intentionally NOT enabled in this migration.
--
-- Run in the Supabase SQL editor or with the Supabase CLI:
--   supabase db push
-- ============================================================================

begin;

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
-- stores the private storage object path or a local private path.
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

commit;
