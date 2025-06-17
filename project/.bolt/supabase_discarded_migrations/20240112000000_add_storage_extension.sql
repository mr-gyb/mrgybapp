-- Create storage schema if it doesn't exist
create schema if not exists storage;

-- Create buckets table if it doesn't exist
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false
);

-- Create objects table if it doesn't exist
create table if not exists storage.objects (
  id uuid default uuid_generate_v4() primary key,
  bucket_id text references storage.buckets,
  name text not null,
  owner uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Create profile-images bucket
insert into storage.buckets (id, name, public)
values ('profile-images', 'Profile Images', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'profile-images' );

create policy "Authenticated users can upload files"
on storage.objects for insert
with check (
  bucket_id = 'profile-images'
  and auth.role() = 'authenticated'
);

create policy "Users can update own files"
on storage.objects for update
using (
  bucket_id = 'profile-images'
  and auth.uid() = owner
);

create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'profile-images'
  and auth.uid() = owner
);