-- Run this once in Supabase: Project → SQL Editor → New Query → paste → Run

create table if not exists tasks (
  id bigint generated always as identity primary key,
  device_id text not null,
  title text not null,
  priority text not null default 'medium',
  date date,
  time text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_device_id_idx on tasks (device_id);
create index if not exists tasks_device_date_idx on tasks (device_id, date);

create table if not exists device_state (
  device_id text primary key,
  streak_count integer not null default 0,
  streak_last text not null default '',
  steps integer not null default 0,
  steps_date text not null default '',
  updated_at timestamptz not null default now()
);
