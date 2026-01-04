create extension if not exists "pgcrypto";

create type challenge_type as enum ('quiz','true_false','match');
create type progress_status as enum ('locked','in_progress','completed');
create type entitlement_status as enum ('active','expired','canceled');

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text default 'user',
  locale text default 'pt-BR',
  created_at timestamptz default now()
);

create table trails (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  objective text,
  order_index int not null,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table trail_translations (
  trail_id uuid not null references trails(id) on delete cascade,
  locale text not null,
  title text not null,
  objective text,
  primary key (trail_id, locale)
);

create table blocks (
  id uuid primary key default gen_random_uuid(),
  trail_id uuid not null references trails(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  is_free boolean default false,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique (trail_id, order_index)
);

create table block_translations (
  block_id uuid not null references blocks(id) on delete cascade,
  locale text not null,
  title text not null,
  description text,
  primary key (block_id, locale)
);

create table phases (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique (block_id, order_index)
);

create table phase_translations (
  phase_id uuid not null references phases(id) on delete cascade,
  locale text not null,
  title text not null,
  description text,
  primary key (phase_id, locale)
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references phases(id) on delete cascade,
  type challenge_type not null,
  payload jsonb not null,
  order_index int not null,
  is_final boolean default false,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique (phase_id, order_index)
);

create table challenge_translations (
  challenge_id uuid not null references challenges(id) on delete cascade,
  locale text not null,
  payload jsonb not null,
  primary key (challenge_id, locale)
);

create table readings (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  title text not null,
  author text,
  url text,
  notes text,
  order_index int not null default 0,
  created_at timestamptz default now(),
  unique (block_id, order_index)
);

create table reading_translations (
  reading_id uuid not null references readings(id) on delete cascade,
  locale text not null,
  title text not null,
  notes text,
  primary key (reading_id, locale)
);

create table phase_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  phase_id uuid not null references phases(id) on delete cascade,
  status progress_status default 'locked',
  score int,
  attempts int default 0,
  last_attempt_at timestamptz,
  primary key (user_id, phase_id)
);

create table block_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references blocks(id) on delete cascade,
  status progress_status default 'locked',
  passed_final_at timestamptz,
  primary key (user_id, block_id)
);

create table challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  result boolean not null,
  answers jsonb,
  created_at timestamptz default now()
);

create table entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  product_id text not null,
  status entitlement_status not null,
  expires_at timestamptz,
  raw_receipt jsonb,
  primary key (user_id, provider, product_id)
);

alter table profiles enable row level security;
alter table trails enable row level security;
alter table trail_translations enable row level security;
alter table blocks enable row level security;
alter table block_translations enable row level security;
alter table phases enable row level security;
alter table phase_translations enable row level security;
alter table challenges enable row level security;
alter table challenge_translations enable row level security;
alter table readings enable row level security;
alter table reading_translations enable row level security;
alter table phase_progress enable row level security;
alter table block_progress enable row level security;
alter table challenge_attempts enable row level security;
alter table entitlements enable row level security;

create policy "profiles_select_own" on profiles
for select using (auth.uid() = user_id);

create policy "profiles_update_own" on profiles
for update using (auth.uid() = user_id);

create policy "trails_select_published" on trails
for select using (is_published = true);

create policy "trail_translations_select_published" on trail_translations
for select using (
  exists (
    select 1 from trails t
    where t.id = trail_id
      and t.is_published = true
  )
);

create policy "blocks_select_published" on blocks
for select using (
  is_published = true
  and exists (
    select 1 from trails t
    where t.id = trail_id
      and t.is_published = true
  )
);

create policy "block_translations_select_published" on block_translations
for select using (
  exists (
    select 1 from blocks b
    join trails t on t.id = b.trail_id
    where b.id = block_id
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "phases_select_published" on phases
for select using (
  is_published = true
  and exists (
    select 1 from blocks b
    join trails t on t.id = b.trail_id
    where b.id = block_id
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "phase_translations_select_published" on phase_translations
for select using (
  exists (
    select 1 from phases p
    join blocks b on b.id = p.block_id
    join trails t on t.id = b.trail_id
    where p.id = phase_id
      and p.is_published = true
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "challenges_select_published" on challenges
for select using (
  is_published = true
  and exists (
    select 1 from phases p
    join blocks b on b.id = p.block_id
    join trails t on t.id = b.trail_id
    where p.id = phase_id
      and p.is_published = true
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "challenge_translations_select_published" on challenge_translations
for select using (
  exists (
    select 1 from challenges c
    join phases p on p.id = c.phase_id
    join blocks b on b.id = p.block_id
    join trails t on t.id = b.trail_id
    where c.id = challenge_id
      and c.is_published = true
      and p.is_published = true
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "readings_select_published" on readings
for select using (
  exists (
    select 1 from blocks b
    join trails t on t.id = b.trail_id
    where b.id = block_id
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "reading_translations_select_published" on reading_translations
for select using (
  exists (
    select 1 from readings r
    join blocks b on b.id = r.block_id
    join trails t on t.id = b.trail_id
    where r.id = reading_id
      and b.is_published = true
      and t.is_published = true
  )
);

create policy "phase_progress_rw_own" on phase_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "block_progress_rw_own" on block_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "challenge_attempts_rw_own" on challenge_attempts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entitlements_select_own" on entitlements
for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      null
    )
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
