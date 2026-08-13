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
create table if not exists blocked_dates (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
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
alter table blocked_dates enable row level security;

-- ---------- one-time provisioning: libur nasional sisa 2026 ----------
-- Only for a FRESH project. Re-running this on a live project resurrects any
-- holiday the admin deliberately deleted from /admin/tanggal-libur.
insert into blocked_dates (id, data) values
  ('holiday-2026-08-17', '{"id":"holiday-2026-08-17","date":"2026-08-17","label":{"id":"Hari Proklamasi Kemerdekaan RI","en":"Indonesian Independence Day"},"locationIds":[],"source":"holiday","active":true}'::jsonb),
  ('holiday-2026-08-25', '{"id":"holiday-2026-08-25","date":"2026-08-25","label":{"id":"Maulid Nabi Muhammad SAW","en":"Birthday of the Prophet Muhammad"},"locationIds":[],"source":"holiday","active":true}'::jsonb),
  ('holiday-2026-12-24', '{"id":"holiday-2026-12-24","date":"2026-12-24","label":{"id":"Cuti Bersama Natal","en":"Christmas joint leave"},"locationIds":[],"source":"holiday","active":true}'::jsonb),
  ('holiday-2026-12-25', '{"id":"holiday-2026-12-25","date":"2026-12-25","label":{"id":"Hari Raya Natal","en":"Christmas Day"},"locationIds":[],"source":"holiday","active":true}'::jsonb)
on conflict (id) do nothing;
alter table settings     enable row level security;
alter table bookings     enable row level security;
alter table leads        enable row level security;
