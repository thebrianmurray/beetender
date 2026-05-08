-- ============================================================
-- Bee Tender — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Surveys table
create table if not exists public.surveys (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users(id) on delete set null,

  site_id                   text not null,
  surveyor_initials         text not null,
  date                      date not null,
  month                     text,
  survey_method             text not null check (survey_method in ('Pan Trap', 'Transect')),
  station_transect_section  text,
  bowl_colour               text check (bowl_colour in ('Yellow', 'White', 'Blue', '')),
  pollinator_group          text not null check (pollinator_group in ('Hoverfly', 'Bumblebee', 'Solitary Bee', 'Butterfly')),
  caste                     text check (caste in ('Not Applicable', 'Worker', 'Male', 'Queen', '')),
  genus                     text,
  species                   text,
  modifier                  text,
  species_name              text,
  id_code                   text,
  determiner                text default 'Brian Murray',
  comments                  text,
  image_url                 text,

  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger surveys_updated_at
  before update on public.surveys
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.surveys enable row level security;

-- Authenticated users can read all surveys
create policy "Authenticated users can read surveys"
  on public.surveys for select
  to authenticated
  using (true);

-- Authenticated users can insert their own surveys
create policy "Authenticated users can insert surveys"
  on public.surveys for insert
  to authenticated
  with check (auth.uid() = user_id OR user_id IS NULL);

-- Users can update any record (all are trusted surveyors)
create policy "Authenticated users can update surveys"
  on public.surveys for update
  to authenticated
  using (true);

-- Users can delete any record
create policy "Authenticated users can delete surveys"
  on public.surveys for delete
  to authenticated
  using (true);

-- ============================================================
-- Storage bucket for survey images
-- Run this or create the bucket manually in Storage dashboard
-- ============================================================
insert into storage.buckets (id, name, public)
values ('survey-images', 'survey-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Auth users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'survey-images');

-- Anyone can view images (public bucket)
create policy "Public can view images"
  on storage.objects for select
  using (bucket_id = 'survey-images');

-- Auth users can delete images
create policy "Auth users can delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'survey-images');
