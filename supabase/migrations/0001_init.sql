-- Family OS — initial schema (PRD §7)
-- Single migration. Demo build: no auth, RLS intentionally disabled so the
-- Supabase publishable (anon) key can read/write. Not for production.

-- ---------- enums ----------
create type person_fact_kind as enum ('allergy','condition','blood_group','insurance','note');
create type asset_type       as enum ('appliance','vehicle');
create type document_type     as enum ('invoice','warranty','amc','insurance','rc','puc','identity','property','other');
create type contact_role      as enum ('doctor','plumber','electrician','ac_tech','car_workshop','car_cleaner','other');
create type reminder_type     as enum ('warranty','insurance','amc','puc','emi','service','identity');
create type reminder_status   as enum ('upcoming','paid','dismissed');

-- ---------- people ----------
create table people (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  initial    text,
  color      text,
  dob        date,
  role       text,
  created_at timestamptz not null default now()
);

-- ---------- assets ----------
create table assets (
  id            uuid primary key default gen_random_uuid(),
  type          asset_type not null,
  name          text not null,
  brand         text,
  model         text,
  serial_or_rc  text,
  room_or_unit  text,
  purchase_date date,
  price         numeric,
  dealer        text,
  icon          text,
  owner_id      uuid references people(id) on delete set null,  -- null = shared/household
  created_at    timestamptz not null default now()
);

-- ---------- documents ----------
create table documents (
  id             uuid primary key default gen_random_uuid(),
  asset_id       uuid references assets(id) on delete set null,
  owner_id       uuid references people(id) on delete set null,  -- null = shared/household
  doc_type       document_type not null,
  file_url       text,
  issue_date     date,
  expiry_date    date,
  amount         numeric,
  extracted_json jsonb,
  created_at     timestamptz not null default now()
);

-- ---------- person_facts ----------
create table person_facts (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references people(id) on delete cascade,
  kind        person_fact_kind not null,
  value       text,
  document_id uuid references documents(id) on delete set null,   -- links the proof
  created_at  timestamptz not null default now()
);

-- ---------- contacts (POC) ----------
create table contacts (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  role             contact_role not null,
  phone            text,
  notes            text,
  linked_asset_id  uuid references assets(id) on delete set null,
  linked_person_id uuid references people(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ---------- expenses ----------
create table expenses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  amount      numeric,
  date        date,
  category    text,
  asset_id    uuid references assets(id) on delete set null,   -- the "AC + maintenance" link
  person_id   uuid references people(id) on delete set null,
  document_id uuid references documents(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- reminders ----------
create table reminders (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid references assets(id) on delete cascade,
  person_id   uuid references people(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  name        text not null,
  type        reminder_type not null,
  due_date    date not null,
  amount      numeric,
  status      reminder_status not null default 'upcoming',
  recurrence  text,
  created_at  timestamptz not null default now(),
  -- must reference at least one of asset/person/document (PRD §7 rule)
  constraint reminders_ref_check check (num_nonnulls(asset_id, person_id, document_id) >= 1)
);

-- ---------- demo access: disable RLS + grant the anon/authenticated roles ----------
alter table people       disable row level security;
alter table assets       disable row level security;
alter table documents    disable row level security;
alter table person_facts disable row level security;
alter table contacts     disable row level security;
alter table expenses     disable row level security;
alter table reminders    disable row level security;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
