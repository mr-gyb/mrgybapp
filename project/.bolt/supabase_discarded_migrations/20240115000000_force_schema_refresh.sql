-- Drop and recreate the profiles table to ensure clean state
drop table if exists public.profiles cascade;

-- Force schema cache refresh before creating table
notify pgrst, 'reload schema';

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text default '',
    username text default '',
    email text default '',
    bio text default '',
    location text default '',
    website text default '',
    industry text default '',
    experienceLevel integer default 1,
    rating numeric default 0,
    following integer default 0,
    followers integer default 0,
    profile_image_url text default 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    cover_image_url text default 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint check_experience_level check (experienceLevel >= 1 and experienceLevel <= 5)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Recreate policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Recreate indexes
drop index if exists profiles_id_idx;
drop index if exists profiles_username_idx;
drop index if exists profiles_email_idx;

create index profiles_id_idx on public.profiles (id);
create index profiles_username_idx on public.profiles (username);
create index profiles_email_idx on public.profiles (email);

-- Recreate trigger
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

-- Force schema cache refresh after all changes
notify pgrst, 'reload schema';

-- Verify the column exists
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'experienceLevel'
  ) then
    raise exception 'experienceLevel column is missing';
  end if;
end $$;