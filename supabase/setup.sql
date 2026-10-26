-- ONE-STEP SETUP: paste this whole file into Supabase > SQL Editor > New query > Run.
-- It creates the database, security rules and storage, then loads the
-- starting content from your resume. Safe to run again: the starting
-- content is only loaded if nothing has been published yet.
-- (Generated from supabase/migrations/0001_init.sql + supabase/seed.sql.)

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


-- =====================================================================
-- 0002: private settings for the ATS resume builder.
-- Resume-builder settings (target title, references, phone choice, ...)
-- are kept OUT of the published site data, so they are never public and
-- editing them doesn't create "Unpublished changes".
-- Run once in Supabase > SQL Editor. Safe to re-run.
-- =====================================================================
create table if not exists public.private_settings (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.private_settings enable row level security;
revoke all on public.private_settings from anon;
grant select, insert, update on public.private_settings to authenticated;
drop policy if exists "admin all" on public.private_settings;
create policy "admin all" on public.private_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop trigger if exists trg_touch on public.private_settings;
create trigger trg_touch before update on public.private_settings
  for each row execute function public.touch_updated_at();

-- Move any resume-builder settings saved by an earlier version.
insert into public.private_settings (id, data)
select 1, jsonb_build_object('ats', s.data -> 'ats') from public.site_settings s
where s.id = 1 and s.data ? 'ats'
on conflict (id) do update set data = public.private_settings.data || excluded.data;
update public.site_settings set data = data - 'ats' where id = 1 and data ? 'ats';
insert into public.private_settings (id) values (1) on conflict do nothing;

-- Never expose resume-builder settings from older published versions.
create or replace function public._public_view(c jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'settings', (case
        when coalesce((c #>> '{settings,profile,show_phone}')::boolean, false) then coalesce(c -> 'settings', '{}'::jsonb)
        else coalesce(c -> 'settings', '{}'::jsonb) #- '{profile,phone}'
      end) - 'ats',
    'experiences',  coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'experiences')  e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'projects',     coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'projects')     e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'skill_groups', coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'skill_groups') e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb),
    'education',    coalesce((select jsonb_agg(e) from jsonb_array_elements(c -> 'education')    e where coalesce((e ->> 'visible')::boolean, true)), '[]'::jsonb)
  );
$$;

notify pgrst, 'reload schema';


-- =====================================================================
-- Initial content, taken only from the resume and academic transcripts.
-- Run ONCE after 0001_init.sql. It replaces all portfolio content and
-- publishes the first version of the site.
-- Fields the resume does not state are left blank on purpose.
-- =====================================================================

do $seed$
begin
if not exists (select 1 from public.publications) then
update public.site_settings set data = $json$
{
  "profile": {
    "full_name": "Mohamad Fakhrullah bin Ibrahim",
    "short_name": "Fakhrullah",
    "title": "System Analyst",
    "headline": "I turn business requirements into clear specifications, system designs and testable solutions.",
    "intro": "System Analyst at HeiTech Padu Berhad, supporting a national immigration system for the Immigration Department of Malaysia. I write SRS and SDD documentation, design system and API flows, and prototype interfaces in Figma.",
    "process_steps": ["Requirements", "SRS & functional specs", "System & API design", "Wireframes & prototypes", "Testing & UAT", "Sign-off & support"],
    "location": "Cyberjaya, Malaysia",
    "availability": { "enabled": true, "text": "Open to System Analyst and Business Analyst opportunities" },
    "photo_path": "",
    "show_photo": true,
    "email": "yoifakrul@gmail.com",
    "phone": "",
    "show_phone": false,
    "linkedin_url": "",
    "github_url": "",
    "other_links": []
  },
  "about": {
    "summary": [
      "I'm a System Analyst with hands-on experience in requirements analysis, system design documentation and back-end development. At HeiTech Padu Berhad I support Project NIISe (Sistem Imigresen Bersepadu Nasional) for the Immigration Department of Malaysia, where I author SRS and SDD documentation, design system and API flows, and produce UI/UX wireframes and interactive prototypes to CMMI-aligned standards.",
      "I studied Computer Science at Universiti Teknologi MARA (UiTM), building a technical base in backend development, databases and machine learning. I want to keep delivering well-documented, reliable systems for large-scale enterprise and government projects."
    ],
    "strengths": [
      "Requirements gathering and business process analysis",
      "SRS, SDD and functional specifications",
      "System flow, data flow and sequence diagrams",
      "API specifications and integration flows",
      "Figma wireframes and interactive prototypes",
      "System testing, API testing and UAT support"
    ],
    "interests": ["System Analyst", "Business Analyst", "Junior Business Analyst", "IT Executive", "Software Developer"],
    "languages": ["Bahasa Malaysia (native)", "English (professional working proficiency)"],
    "activities": [
      "Head of Publishing, Relex Club: led the creation, editing and publication of club materials.",
      "Head of Event, VistaVoyage Hike: organised the event end to end, covering logistics, budget, risk assessment and participant engagement."
    ]
  },
  "resume": { "path": "", "file_name": "", "updated_at": "", "show_preview": true },
  "seo": {
    "title": "Mohamad Fakhrullah bin Ibrahim | System Analyst",
    "description": "System Analyst in Malaysia specialising in requirements analysis, SRS and SDD documentation, system and API flow design, Figma prototyping and UAT support.",
    "og_image_path": ""
  },
  "theme": { "accent": "#2450D8", "default_mode": "light", "allow_toggle": true },
  "sections": { "about": true, "experience": true, "projects": true, "skills": true, "education": true, "resume": true, "contact": true },
  "contact": {
    "intro": "Hiring for a System Analyst, Business Analyst or IT role? Send a message and I'll reply by email.",
    "form_enabled": true
  }
}
$json$::jsonb
where id = 1;

delete from public.experiences where true;
insert into public.experiences (company, role, employment_type, work_mode, location, context, start_date, end_date, is_current, summary, highlights, tools, sort_order) values
(
  'HeiTech Padu Berhad', 'System Analyst', '', 'On-site', 'Cyberjaya, Malaysia',
  'Project NIISe, Immigration Department of Malaysia',
  '2026-02', '', true,
  'Analysis, specification and design documentation for a national immigration system, working with developers, testers and stakeholders.',
  array[
    'Analysed business and system requirements through stakeholder discussions, workflow studies and process documentation.',
    'Prepared SRS and SDD documentation, ensuring each module met client sign-off and CMMI documentation standards.',
    'Designed system flow diagrams, process workflows, functional specifications and system procedures used by developers as the build reference.',
    'Designed backend processes and API flows for integration across modules and external agencies.',
    'Prepared API specifications, request/response structures and data flow diagrams (DFD) for development and integration teams.',
    'Created sequence diagrams and wireflows to document system interactions and end-to-end user journeys.',
    'Produced UI/UX wireframes and interactive prototypes in Figma to align stakeholder expectations before development.',
    'Collaborated with developers, testers and stakeholders to translate business requirements into workable technical solutions.',
    'Conducted system testing, API testing, debugging and defect analysis, and supported User Acceptance Testing (UAT) through to sign-off.',
    'Provided application support and technical assistance during implementation and deployment.',
    'Documented existing processes and recommended system and process improvements to reduce manual handling.'
  ],
  array['Figma','SRS','SDD','DFD','Sequence diagrams','Wireflows','API specifications','UAT','CMMI'],
  1
),
(
  'IASME Group', 'Full-Stack Developer', 'Internship', '', '', '',
  '2025-03', '2025-06', false,
  'Built myIASME.com, a product management system for tracking products, sales performance and stock.',
  array[
    'Built myIASME.com, a product management system used to track products, sales performance and stock across four user roles.',
    'Developed core modules including product reporting, add/edit product features and dashboards computing profit, sales margin, ROI, stock levels, winning DNA insights and product proposals.',
    'Designed and implemented role-based access control for a multi-user environment.',
    'Deployed and maintained the system on GBNetwork hosting, handling real-world configuration and upkeep.'
  ],
  array[]::text[],
  2
),
(
  'LKPP Corporation', 'Web Developer', 'Internship', '', '', '',
  '2022-09', '2023-02', false,
  'Developed the e-Kenderaan vehicle booking project and supported internal communication materials.',
  array[
    'Developed the e-Kenderaan vehicle booking project using NetBeans and HeidiSQL, covering booking details, vehicle status and driver assignment.',
    'Redesigned the main user interface to give staff and administrators a clearer view of booking and vehicle status.',
    'Produced a six-minute video tutorial and supporting materials to train staff on the system.',
    'Designed posters and presentation slides for internal company use with Canva.'
  ],
  array['NetBeans','HeidiSQL','Canva'],
  3
);

delete from public.projects where true;
insert into public.projects (title, category, year, summary, role, contributions, awards, tech, visual, confidential, featured, sort_order) values
(
  'Project NIISe: National Immigration System', 'System analysis', '2026 – present',
  'Requirements, specification and design documentation for a national immigration system delivered for the Immigration Department of Malaysia.',
  'System Analyst at HeiTech Padu Berhad (analysis, documentation and testing support; not the full system build)',
  array[
    'Authored SRS and SDD documentation to CMMI-aligned standards for client sign-off.',
    'Designed system flows, data flow diagrams, sequence diagrams and wireflows.',
    'Prepared API specifications and request/response structures for integration teams.',
    'Produced Figma wireframes and interactive prototypes before development.',
    'Supported system testing, API testing, defect analysis and UAT.'
  ],
  array[]::text[],
  array['Figma','DFD','Sequence diagrams','API specifications','UAT'],
  'flow', true, true, 1
),
(
  'myIASME Product Management System', 'Web application', '2025',
  'A product management system used to track products, sales performance and stock across four user roles.',
  'Full-Stack Developer (Internship) at IASME Group',
  array[
    'Developed product reporting and add/edit product modules.',
    'Built dashboards computing profit, sales margin, ROI, stock levels, winning DNA insights and product proposals.',
    'Designed and implemented role-based access control for four user roles.',
    'Deployed and maintained the system on GBNetwork hosting.'
  ],
  array[]::text[],
  array[]::text[],
  'dashboard', false, true, 2
),
(
  'Examination Invigilation Timetabling System', 'Final year project', '2025',
  'An automated invigilator scheduling system using a Genetic Algorithm, replacing manual timetabling and reducing assignment effort.',
  'Final year project, Bachelor of Computer Science (UiTM)',
  array[
    'Built automated invigilator scheduling with a Genetic Algorithm.',
    'Modelled constraints such as invigilator availability, subject expertise and exam slots to distribute workload fairly.'
  ],
  array['Best Project Award (COMMAX)', 'Silver Award, 4th Graduate Invention, Innovation & Design Competition (GDIID 2025)'],
  array['Genetic Algorithm'],
  'schedule', false, true, 3
),
(
  'TikTok Sentiment Analysis Web Application', 'Machine learning', '2024',
  'A Flask web application that classifies user reviews as positive, neutral or negative using a trained TF-IDF and classifier pipeline.',
  'Developer',
  array[
    'Engineered a /predict backend route returning JSON predictions with confidence scores for real-time UI updates.',
    'Built a responsive front end with HTML, Tailwind CSS and JavaScript.'
  ],
  array[]::text[],
  array['Python','Flask','TF-IDF','HTML','Tailwind CSS','JavaScript'],
  'chart', false, false, 4
),
(
  'E-Kelas Mengaji Learning Platform', 'Web application', '2023',
  'An online platform connecting Quran students with qualified tutors.',
  'Designer and developer',
  array[
    'Designed and developed the platform.',
    'Implemented secure authentication, session management and class scheduling.'
  ],
  array[]::text[],
  array['PHP','MySQL'],
  'learning', false, false, 5
),
(
  'e-Kenderaan Vehicle Booking System', 'Web application', '2022 – 2023',
  'A vehicle booking project covering booking details, vehicle status and driver assignment, built during an internship at LKPP Corporation.',
  'Web Developer (Internship) at LKPP Corporation',
  array[
    'Developed booking details, vehicle status and driver assignment features.',
    'Redesigned the main user interface for a clearer view of booking and vehicle status.',
    'Produced a six-minute video tutorial to train staff on the system.'
  ],
  array[]::text[],
  array['NetBeans','HeidiSQL'],
  'booking', false, false, 6
);

delete from public.skill_groups where true;
insert into public.skill_groups (name, items, sort_order) values
('System analysis & requirements', array['Requirements gathering','Business process analysis','Gap analysis','Functional specifications','System procedures'], 1),
('Documentation', array['SRS','SDD','CMMI documentation standards'], 2),
('Design & modelling', array['Data Flow Diagrams (DFD)','Sequence diagrams','System flow diagrams','Workflow diagrams','Wireflows','API specifications'], 3),
('UI/UX', array['Figma','Wireframing','Interactive prototyping','User journey mapping'], 4),
('Testing & support', array['System testing','API testing (Postman-style)','Defect analysis','UAT support'], 5),
('Programming & web', array['Python','Java','PHP','JavaScript','HTML','CSS','Flask','Tailwind CSS'], 6),
('Databases', array['Oracle','MySQL','HeidiSQL','phpMyAdmin'], 7),
('Tools & practices', array['VS Code','NetBeans','Jupyter','GitKraken','Agile collaboration'], 8);

delete from public.education where true;
insert into public.education (institution, qualification, field, location, start_date, end_date, grade, details, sort_order) values
(
  'Universiti Teknologi MARA (UiTM), Kampus Kuala Terengganu', 'Bachelor of Computer Science (Hons)', 'Computer Science', 'Kuala Terengganu, Malaysia',
  '2023-03', '2025-06', 'CGPA 3.34',
  array[
    'Final year project: Examination Invigilation Timetabling System (Best Project Award, COMMAX; Silver Award, GDIID 2025)',
    'Coursework includes Software Engineering, Database Engineering, Enterprise Programming, Data Structures, Artificial Intelligence, Computer Security and Image Processing'
  ],
  1
),
(
  'Universiti Teknologi MARA (UiTM), Kampus Raub', 'Diploma in Computer Science', 'Computer Science', 'Raub, Pahang',
  '2020-06', '2023-02', 'CGPA 3.28',
  array[
    'Coursework includes Introduction to Database, Discrete Mathematics and Interactive Multimedia',
    'Practical training: Web Developer intern at LKPP Corporation'
  ],
  2
),
(
  'SMK Seri Panching', 'Sijil Pelajaran Malaysia (SPM)', '', 'Kuantan, Pahang',
  '2015-01', '2019-12', '6A 3B',
  array[]::text[],
  3
);

-- Publish the first version so the public site has content immediately.
insert into public.publications (content, note) values (public._build_snapshot(), 'Initial content from resume');
update public.site_state set last_published_at = now(), last_change_at = now() where id = 1;
end if;
end
$seed$;
