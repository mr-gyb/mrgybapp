-- Enable UUID extension
create extension if not exists "uuid-ossp" schema "extensions";

-- Create storage schema
create schema if not exists storage;

-- Create storage buckets table
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false
);

-- Create storage objects table
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

-- Set up RLS policies for storage
alter table storage.objects enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Users can upload their own profile images" on storage.objects;
drop policy if exists "Users can update their own profile images" on storage.objects;

-- Create new policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'profile-images' );

create policy "Users can upload their own profile images"
on storage.objects for insert
with check (
  bucket_id = 'profile-images'
  and auth.uid() = owner
);

create policy "Users can update their own profile images"
on storage.objects for update
using (
  bucket_id = 'profile-images'
  and auth.uid() = owner
);

-- Fix profile schema
drop table if exists public.profiles;

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text default '',
    username text default '',
    email text default '',
    bio text default '',
    location text default '',
    website text default '',
    industry text default '',
    experienceLevel integer default 1 check (experienceLevel between 1 and 5),
    rating numeric default 0,
    following integer default 0,
    followers integer default 0,
    profile_image_url text default 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    cover_image_url text default 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop existing profile policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create profile policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create indexes
create index if not exists profiles_id_idx on public.profiles (id);
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_email_idx on public.profiles (email);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_profiles_updated_at on profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Grant permissions
grant usage on schema public to authenticated;
grant all on profiles to authenticated;

-- Refresh schema cache
notify pgrst, 'reload schema';