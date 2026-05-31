begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.mobile_account_onboarding_profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique references auth.users(id) on delete cascade,

  private_target_slug text not null default 'isabela',

  email text not null check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),

  full_name text not null check (char_length(full_name) between 2 and 120),
  nickname text check (nickname is null or char_length(nickname) between 1 and 48),
  username text check (username is null or username ~ '^[a-z0-9_]{3,24}$'),

  birth_date date not null,
  age_years integer not null check (age_years between 1 and 130),
  is_minor boolean not null default false,

  city text not null check (char_length(city) between 2 and 120),
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  country_code text not null default 'BRA' check (country_code ~ '^[A-Z]{2,3}$'),

  species_code text not null default 'IRIS_PARTNER',
  stage_code text not null default 'SEMENTE',
  inclination_code text not null default 'NULO',

  onboarding_status text not null default 'completed'
    check (onboarding_status in ('draft', 'email_pending', 'completed')),

  completed_at timestamptz,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mobile_account_onboarding_profiles_set_updated_at
on public.mobile_account_onboarding_profiles;

create trigger mobile_account_onboarding_profiles_set_updated_at
before update on public.mobile_account_onboarding_profiles
for each row
execute function public.set_updated_at();

alter table public.mobile_account_onboarding_profiles enable row level security;

drop policy if exists "Users can read own mobile onboarding profile"
on public.mobile_account_onboarding_profiles;

create policy "Users can read own mobile onboarding profile"
on public.mobile_account_onboarding_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update own mobile onboarding profile"
on public.mobile_account_onboarding_profiles;

create policy "Users can update own mobile onboarding profile"
on public.mobile_account_onboarding_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists mobile_account_onboarding_profiles_user_idx
on public.mobile_account_onboarding_profiles (user_id);

create index if not exists mobile_account_onboarding_profiles_status_idx
on public.mobile_account_onboarding_profiles (onboarding_status);

create or replace function public.get_my_mobile_official_onboarding()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
  v_payload jsonb;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    return jsonb_build_object(
      'authenticated', false,
      'completed', false,
      'profile', null
    );
  end if;

  select jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'email', p.email,
    'full_name', p.full_name,
    'nickname', p.nickname,
    'username', p.username,
    'birth_date', p.birth_date,
    'age_years', p.age_years,
    'is_minor', p.is_minor,
    'city', p.city,
    'state_code', p.state_code,
    'country_code', p.country_code,
    'species_code', p.species_code,
    'stage_code', p.stage_code,
    'inclination_code', p.inclination_code,
    'onboarding_status', p.onboarding_status,
    'completed_at', p.completed_at
  )
  into v_payload
  from public.mobile_account_onboarding_profiles p
  where p.user_id = v_auth_user_id
  limit 1;

  return jsonb_build_object(
    'authenticated', true,
    'completed', coalesce((v_payload ->> 'onboarding_status') = 'completed', false),
    'profile', v_payload
  );
end;
$$;

grant execute on function public.get_my_mobile_official_onboarding()
to authenticated;

create or replace function public.complete_mobile_official_onboarding(
  p_email text,
  p_full_name text,
  p_nickname text,
  p_username text,
  p_birth_date date,
  p_city text,
  p_state_code text default null,
  p_country_code text default 'BRA',
  p_private_target_slug text default 'isabela'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
  v_age integer;
  v_is_minor boolean;
  v_profile_id uuid;
  v_clean_username text;
  v_clean_state text;
  v_country text;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    return jsonb_build_object(
      'completed', false,
      'reason', 'unauthenticated'
    );
  end if;

  v_age := extract(year from age(current_date, p_birth_date))::integer;
  v_is_minor := v_age < 18;
  v_clean_username := nullif(lower(trim(p_username)), '');
  v_clean_state := nullif(upper(trim(coalesce(p_state_code, ''))), '');
  v_country := upper(trim(coalesce(p_country_code, 'BRA')));

  if v_age < 13 then
    return jsonb_build_object(
      'completed', false,
      'reason', 'minimum_age'
    );
  end if;

  if v_clean_username is not null and v_clean_username !~ '^[a-z0-9_]{3,24}$' then
    return jsonb_build_object(
      'completed', false,
      'reason', 'invalid_username'
    );
  end if;

  insert into public.mobile_account_onboarding_profiles (
    user_id,
    private_target_slug,
    email,
    full_name,
    nickname,
    username,
    birth_date,
    age_years,
    is_minor,
    city,
    state_code,
    country_code,
    species_code,
    stage_code,
    inclination_code,
    onboarding_status,
    completed_at,
    terms_accepted_at,
    privacy_accepted_at,
    metadata
  )
  values (
    v_auth_user_id,
    coalesce(nullif(trim(p_private_target_slug), ''), 'isabela'),
    lower(trim(p_email)),
    trim(p_full_name),
    nullif(trim(p_nickname), ''),
    v_clean_username,
    p_birth_date,
    v_age,
    v_is_minor,
    trim(p_city),
    v_clean_state,
    v_country,
    'IRIS_PARTNER',
    'SEMENTE',
    'NULO',
    'completed',
    now(),
    now(),
    now(),
    jsonb_build_object(
      'source', 'mobile_first_access',
      'private_target_slug', coalesce(nullif(trim(p_private_target_slug), ''), 'isabela')
    )
  )
  on conflict (user_id)
  do update set
    private_target_slug = excluded.private_target_slug,
    email = excluded.email,
    full_name = excluded.full_name,
    nickname = excluded.nickname,
    username = excluded.username,
    birth_date = excluded.birth_date,
    age_years = excluded.age_years,
    is_minor = excluded.is_minor,
    city = excluded.city,
    state_code = excluded.state_code,
    country_code = excluded.country_code,
    species_code = excluded.species_code,
    stage_code = excluded.stage_code,
    inclination_code = excluded.inclination_code,
    onboarding_status = 'completed',
    completed_at = now(),
    terms_accepted_at = now(),
    privacy_accepted_at = now(),
    metadata = excluded.metadata,
    updated_at = now()
  returning id into v_profile_id;

  return jsonb_build_object(
    'completed', true,
    'profile_id', v_profile_id,
    'is_minor', v_is_minor,
    'age_years', v_age,
    'success_route', '/home'
  );
end;
$$;

grant execute on function public.complete_mobile_official_onboarding(
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text
)
to authenticated;

commit;
