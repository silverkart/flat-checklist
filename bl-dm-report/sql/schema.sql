-- Banchory Lodge — Duty Manager Report
-- First-time setup schema. Safe to re-run (IF NOT EXISTS everywhere).
--
-- NOTE: these tables already exist in the live project. This file is the reference
-- copy shown on the Admin tab; reconcile column names with the live database /
-- dm-report-v17.html before relying on it for a fresh project.
-- dm_room_status is deprecated and intentionally omitted.

create table if not exists dm_daily_report (
  report_date         date primary key,
  duty_manager        text,
  rooms_occupied      integer,
  guests_total        integer,
  rooms_revenue_gbp   numeric(10,2),
  budget_revenue_gbp  numeric(10,2),
  breakfast_covers    integer,
  lunch_covers        integer,
  dinner_covers       integer,
  dinner_walkins      integer,
  vip_notes           text,
  maintenance_notes   text,
  updated_at          timestamptz not null default now()
);

create table if not exists restaurant_service_type (
  id          serial primary key,
  name        text not null unique,
  sort_order  integer not null default 0
);

create table if not exists restaurant_area (
  id          serial primary key,
  name        text not null unique,
  sort_order  integer not null default 0
);

insert into restaurant_service_type (name, sort_order) values
  ('Lunch', 1), ('Dinner', 2), ('Afternoon Tea', 3), ('Funeral Tea', 4)
on conflict (name) do nothing;

insert into restaurant_area (name, sort_order) values
  ('Bar', 1), ('Dining Room', 2), ('Lounge', 3), ('Dee Room', 4)
on conflict (name) do nothing;

create table if not exists restaurant_booking (
  booking_date     date    not null,
  service_type_id  integer not null references restaurant_service_type(id),
  area_id          integer not null references restaurant_area(id),
  covers           integer not null default 0,
  updated_at       timestamptz not null default now(),
  primary key (booking_date, service_type_id, area_id)
);

create table if not exists rooms_booking_forecast (
  forecast_date  date primary key,
  rooms_booked   integer,
  guests_est     integer,
  updated_at     timestamptz not null default now()
);

create table if not exists dm_weekly_stats (
  season      text primary key,          -- e.g. '25-26'
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Row Level Security: the app uses the anon key, so anon needs read/write.
-- Anyone holding the URL + anon key can read and write these tables.
alter table dm_daily_report         enable row level security;
alter table restaurant_service_type enable row level security;
alter table restaurant_area         enable row level security;
alter table restaurant_booking      enable row level security;
alter table rooms_booking_forecast  enable row level security;
alter table dm_weekly_stats         enable row level security;

do $$
declare t text;
begin
  foreach t in array array['dm_daily_report','restaurant_service_type','restaurant_area',
                           'restaurant_booking','rooms_booking_forecast','dm_weekly_stats'] loop
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'anon_all') then
      execute format('create policy anon_all on %I for all to anon using (true) with check (true)', t);
    end if;
  end loop;
end $$;
