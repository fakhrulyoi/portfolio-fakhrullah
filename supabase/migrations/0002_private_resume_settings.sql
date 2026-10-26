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
