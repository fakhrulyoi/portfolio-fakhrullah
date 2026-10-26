-- =====================================================================
-- Portfolio CMS — database schema, security policies and functions
-- Run once in the Supabase SQL Editor (or `supabase db push`).
-- Safe to re-run: every statement is idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Admins (who may edit content). There is NO public sign-up path:
--    an admin row can only be created from the SQL Editor via
--    public.grant_admin('you@example.com').
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon;
grant select on public.admins to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Admins can see their own admin row (used to confirm access).
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.grant_admin(p_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'No auth user with email %. Create the user first (Authentication > Users > Add user).', p_email;
  end if;
  insert into public.admins (user_id) values (v_id) on conflict do nothing;
  return 'Admin access granted to ' || p_email;
end;
$$;
-- Only the database owner (SQL Editor) may grant admin rights.
revoke all on function public.grant_admin(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Shared helpers
-- ---------------------------------------------------------------------
create table if not exists public.site_state (
  id                smallint primary key default 1 check (id = 1),
  last_change_at    timestamptz not null default now(),
  last_published_at timestamptz
);
alter table public.site_state enable row level security;
revoke all on public.site_state from anon;
grant select on public.site_state to authenticated;
insert into public.site_state (id) values (1) on conflict do nothing;

drop policy if exists "admin read state" on public.site_state;
create policy "admin read state" on public.site_state
  for select to authenticated using (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Records "something changed since the last publish".
create or replace function public.mark_content_changed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.site_state set last_change_at = now() where id = 1;
  return null;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Content tables (these hold the DRAFT / working copy)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id              uuid primary key default gen_random_uuid(),
  company         text not null default '' check (char_length(company) <= 160),
  role            text not null default '' check (char_length(role) <= 160),
  employment_type text not null default '' check (char_length(employment_type) <= 60),
  work_mode       text not null default '' check (char_length(work_mode) <= 60),
  location        text not null default '' check (char_length(location) <= 160),
  context         text not null default '' check (char_length(context) <= 240),
  start_date      text not null default '' check (start_date = '' or start_date ~ '^\d{4}-\d{2}$'),
  end_date        text not null default '' check (end_date = '' or end_date ~ '^\d{4}-\d{2}$'),
  is_current      boolean not null default false,
  summary         text not null default '' check (char_length(summary) <= 1200),
  highlights      text[] not null default '{}',
  tools           text[] not null default '{}',
  visible         boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  title          text not null default '' check (char_length(title) <= 160),
  category       text not null default '' check (char_length(category) <= 80),
  year           text not null default '' check (char_length(year) <= 40),
  summary        text not null default '' check (char_length(summary) <= 600),
  role           text not null default '' check (char_length(role) <= 200),
  contributions  text[] not null default '{}',
  awards         text[] not null default '{}',
  tech           text[] not null default '{}',
  image_path     text not null default '' check (char_length(image_path) <= 500),
  image_alt      text not null default '' check (char_length(image_alt) <= 200),
  visual         text not null default 'flow' check (visual in ('flow','dashboard','schedule','chart','booking','learning','document')),
  live_url       text not null default '' check (live_url = '' or live_url ~* '^https?://'),
  repo_url       text not null default '' check (repo_url = '' or repo_url ~* '^https?://'),
  case_study_url text not null default '' check (case_study_url = '' or case_study_url ~* '^https?://'),
  confidential   boolean not null default false,
  featured       boolean not null default false,
  visible        boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.skill_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '' check (char_length(name) <= 120),
  items      text[] not null default '{}',
  visible    boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id            uuid primary key default gen_random_uuid(),
  institution   text not null default '' check (char_length(institution) <= 200),
  qualification text not null default '' check (char_length(qualification) <= 200),
  field         text not null default '' check (char_length(field) <= 160),
  location      text not null default '' check (char_length(location) <= 160),
  start_date    text not null default '' check (start_date = '' or start_date ~ '^\d{4}-\d{2}$'),
  end_date      text not null default '' check (end_date = '' or end_date ~ '^\d{4}-\d{2}$'),
  grade         text not null default '' check (char_length(grade) <= 80),
  details       text[] not null default '{}',
  visible       boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Triggers + RLS for every content table
do $$
declare t text;
begin
  foreach t in array array['site_settings','experiences','projects','skill_groups','education'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop trigger if exists trg_touch on public.%I', t);
    execute format('create trigger trg_touch before update on public.%I for each row execute function public.touch_updated_at()', t);
    execute format('drop trigger if exists trg_changed on public.%I', t);
    execute format('create trigger trg_changed after insert or update or delete on public.%I for each statement execute function public.mark_content_changed()', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

insert into public.site_settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
-- 4. Publishing: immutable snapshots. The public website ONLY reads the
--    latest snapshot, so drafts are never visible until published.
--    Snapshots double as a version history / backup.
-- ---------------------------------------------------------------------
create table if not exists public.publications (
  id           bigint generated always as identity primary key,
  content      jsonb not null,
  note         text not null default '' check (char_length(note) <= 200),
  published_by uuid references auth.users (id) on delete set null,
  published_at timestamptz not null default now()
);
alter table public.publications enable row level security;
revoke all on public.publications from anon;
grant select on public.publications to authenticated;
drop policy if exists "admin read publications" on public.publications;
create policy "admin read publications" on public.publications
  for select to authenticated using (public.is_admin());

-- Full backup of the working copy (includes hidden items).
create or replace function public._build_snapshot()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'settings',     coalesce((select data from public.site_settings where id = 1), '{}'::jsonb),
    'experiences',  coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order, x.created_at) from public.experiences x), '[]'::jsonb),
    'projects',     coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order, x.created_at) from public.projects x), '[]'::jsonb),
    'skill_groups', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order, x.created_at) from public.skill_groups x), '[]'::jsonb),
    'education',    coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order, x.created_at) from public.education x), '[]'::jsonb)
  );
$$;
revoke all on function public._build_snapshot() from public, anon, authenticated;

-- What visitors are allowed to see from a snapshot: visible items only,
-- phone number removed unless the owner chose to show it.
create or replace function public._public_view(c jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'settings', case
        when coalesce((c #>> '{settings,profile,show_phone}')::boolean, false) then c -> 'settings'
        else coalesce(c -> 'settings', '{}'::jsonb) #- '{profile,phone}'
      end,
    'experiences',  coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'experiences')  e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'projects',     coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'projects')     e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'skill_groups', coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'skill_groups') e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'education',    coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'education')    e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb)
  );
$$;

-- PUBLIC: latest published portfolio (null if never published).
create or replace function public.get_published_portfolio()
returns jsonb language sql stable security definer set search_path = '' as $$
  select public._public_view(p.content) || jsonb_build_object('published_at', p.published_at)
  from public.publications p
  order by p.id desc
  limit 1;
$$;
grant execute on function public.get_published_portfolio() to anon, authenticated;

-- ADMIN: what the site would look like if published now (preview).
create or replace function public.get_draft_portfolio()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  return public._public_view(public._build_snapshot()) || jsonb_build_object('published_at', null);
end;
$$;
revoke all on function public.get_draft_portfolio() from public, anon;
grant execute on function public.get_draft_portfolio() to authenticated;

create or replace function public.publish_site(p_note text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_row public.publications;
begin
  if not public.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  insert into public.publications (content, note, published_by)
  values (public._build_snapshot(), left(coalesce(p_note, ''), 200), auth.uid())
  returning * into v_row;
  update public.site_state set last_published_at = v_row.published_at, last_change_at = v_row.published_at where id = 1;
  return jsonb_build_object('id', v_row.id, 'published_at', v_row.published_at);
end;
$$;
revoke all on function public.publish_site(text) from public, anon;
grant execute on function public.publish_site(text) to authenticated;

-- Recovery: replace the working copy with an older snapshot and publish it.
create or replace function public.restore_publication(p_id bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c jsonb;
begin
  if not public.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  select content into c from public.publications where id = p_id;
  if c is null then raise exception 'Version % not found', p_id; end if;

  update public.site_settings set data = coalesce(c -> 'settings', '{}'::jsonb) where id = 1;

  delete from public.experiences where true;
  insert into public.experiences select * from jsonb_populate_recordset(null::public.experiences, coalesce(c -> 'experiences', '[]'::jsonb));
  delete from public.projects where true;
  insert into public.projects select * from jsonb_populate_recordset(null::public.projects, coalesce(c -> 'projects', '[]'::jsonb));
  delete from public.skill_groups where true;
  insert into public.skill_groups select * from jsonb_populate_recordset(null::public.skill_groups, coalesce(c -> 'skill_groups', '[]'::jsonb));
  delete from public.education where true;
  insert into public.education select * from jsonb_populate_recordset(null::public.education, coalesce(c -> 'education', '[]'::jsonb));

  return public.publish_site('Restored version #' || p_id);
end;
$$;
revoke all on function public.restore_publication(bigint) from public, anon;
grant execute on function public.restore_publication(bigint) to authenticated;

-- Reorder helper: sets sort_order to the position in p_ids.
create or replace function public.reorder_items(p_table text, p_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_table not in ('experiences','projects','skill_groups','education') then
    raise exception 'Invalid table';
  end if;
  if not public.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  execute format(
    'update public.%I t set sort_order = o.pos from unnest($1) with ordinality as o(id, pos) where t.id = o.id',
    p_table) using p_ids;
end;
$$;
revoke all on function public.reorder_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Contact messages. Visitors never touch this table directly: the
--    website's server route calls submit_contact_message with the
--    server-only secret key, after spam checks.
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    text not null default '' check (char_length(subject) <= 200),
  message    text not null check (char_length(message) between 10 and 5000),
  ip_hash    text not null default '',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon;
grant select, update, delete on public.contact_messages to authenticated;
drop policy if exists "admin read messages" on public.contact_messages;
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists "admin update messages" on public.contact_messages;
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete messages" on public.contact_messages;
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.is_admin());

create or replace function public.submit_contact_message(
  p_name text, p_email text, p_subject text, p_message text, p_ip_hash text
) returns text language plpgsql security definer set search_path = '' as $$
begin
  -- 3 messages per sender per 15 minutes, 100 per day overall.
  if (select count(*) from public.contact_messages
        where ip_hash = coalesce(p_ip_hash, '') and created_at > now() - interval '15 minutes') >= 3 then
    return 'rate_limited';
  end if;
  if (select count(*) from public.contact_messages where created_at > now() - interval '1 day') >= 100 then
    return 'rate_limited';
  end if;
  insert into public.contact_messages (name, email, subject, message, ip_hash)
  values (trim(p_name), trim(p_email), trim(coalesce(p_subject, '')), trim(p_message), coalesce(p_ip_hash, ''));
  return 'ok';
end;
$$;
revoke all on function public.submit_contact_message(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_contact_message(text, text, text, text, text) to service_role;

-- ---------------------------------------------------------------------
-- 6. Storage: public-read buckets, writes restricted to the admin.
--    File type and size limits are enforced by Supabase itself.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('images',    'images',    true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif']),
  ('documents', 'documents', true, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio admin read"   on storage.objects;
drop policy if exists "portfolio admin insert" on storage.objects;
drop policy if exists "portfolio admin update" on storage.objects;
drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin read" on storage.objects for select to authenticated
  using (bucket_id in ('images','documents') and public.is_admin());
create policy "portfolio admin insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('images','documents') and public.is_admin());
create policy "portfolio admin update" on storage.objects for update to authenticated
  using (bucket_id in ('images','documents') and public.is_admin())
  with check (bucket_id in ('images','documents') and public.is_admin());
create policy "portfolio admin delete" on storage.objects for delete to authenticated
  using (bucket_id in ('images','documents') and public.is_admin());
