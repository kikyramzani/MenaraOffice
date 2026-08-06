-- Menara Office — Supabase schema.
-- Run once in the SQL editor of a fresh Supabase project, then set
-- NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in Vercel.
--
-- Model: content entities are JSONB documents (read/written whole by the
-- admin panel); bookings and leads are relational tables because they are
-- queried by column and written by anonymous visitors through the API.

create extension if not exists btree_gist;

-- ---------- content documents ----------
create table if not exists services      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists locations     (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists rooms         (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists posts         (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists testimonials  (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists partners      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists settings      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());

-- ---------- transactional tables ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  name text not null,
  phone text not null,
  email text not null,
  date date not null,
  start_hour smallint not null check (start_hour between 0 and 23),
  end_hour smallint not null check (end_hour between 1 and 24 and end_hour > start_hour),
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Hard guarantee against double bookings: two non-cancelled bookings for the
-- same room and date may never have overlapping [start, end) hour ranges.
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    room_id with =,
    date with =,
    int4range(start_hour, end_hour) with &&
  ) where (status <> 'cancelled');

create index if not exists bookings_room_date_idx on bookings (room_id, date);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  service text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------
-- All application access goes through the Next.js server using the
-- service-role key (which bypasses RLS). Enabling RLS with no policies denies
-- everything to the anon/authenticated roles, so the anon key is inert.
alter table services     enable row level security;
alter table locations    enable row level security;
alter table rooms        enable row level security;
alter table posts        enable row level security;
alter table testimonials enable row level security;
alter table partners     enable row level security;
alter table settings     enable row level security;
alter table bookings     enable row level security;
alter table leads        enable row level security;
