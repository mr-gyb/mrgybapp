-- Enable better error reporting
set client_min_messages to 'debug';

-- Log start of migration
do $$ 
begin
  raise notice 'Starting profile schema migration...';
end $$;

-- Force schema cache refresh
notify pgrst, 'reload schema';

-- Log table drop
do $$
begin
  raise notice 'Dropping existing profiles table if exists...';
end $$;

drop table if exists public.profiles cascade;

-- Log table creation
do $$
begin
  raise notice 'Creating new profiles table...';
end $$;

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text default '',
    username text default '',
    email text default '',
    bio text default '',
    location text default '',
    website text default '',
    industry text default '',
    experiencelevel integer default 1,
    rating numeric default 0,
    following integer default 0,
    followers integer default 0,
    profile_image_url text default 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    cover_image_url text default 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint check_experience_level check (experiencelevel >= 1 and experiencelevel <= 5)
);

-- Log column verification
do $$
declare
    column_exists boolean;
begin
    raise notice 'Verifying experiencelevel column...';
    
    select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'experiencelevel'
    ) into column_exists;
    
    if column_exists then
        raise notice 'experiencelevel column exists';
    else
        raise notice 'experiencelevel column is missing';
        
        -- Get all columns for debugging
        raise notice 'Current columns in profiles table:';
        for column_record in 
            select column_name, data_type
            from information_schema.columns
            where table_schema = 'public'
            and table_name = 'profiles'
        loop
            raise notice 'Column: %, Type: %', column_record.column_name, column_record.data_type;
        end loop;
        
        raise exception 'experiencelevel column is missing';
    end if;
end $$;

-- Enable RLS
do $$
begin
  raise notice 'Enabling Row Level Security...';
end $$;

alter table public.profiles enable row level security;

-- Recreate policies
do $$
begin
  raise notice 'Creating RLS policies...';
end $$;

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
do $$
begin
  raise notice 'Creating indexes...';
end $$;

create index profiles_id_idx on public.profiles (id);
create index profiles_username_idx on public.profiles (username);
create index profiles_email_idx on public.profiles (email);

-- Create trigger
do $$
begin
  raise notice 'Creating updated_at trigger...';
end $$;

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
do $$
begin
  raise notice 'Granting permissions...';
end $$;

grant usage on schema public to authenticated;
grant all on profiles to authenticated;

-- Final schema cache refresh
do $$
begin
  raise notice 'Performing final schema cache refresh...';
end $$;

notify pgrst, 'reload schema';

-- Final verification
do $$
declare
    column_info record;
begin
    raise notice 'Performing final verification...';
    
    select *
    from information_schema.columns
    where table_schema = 'public'
    and table_name = 'profiles'
    and column_name = 'experiencelevel'
    into column_info;
    
    if found then
        raise notice 'Final verification passed: experiencelevel column exists with type %', column_info.data_type;
    else
        raise exception 'Final verification failed: experiencelevel column is missing';
    end if;
    
    raise notice 'Migration completed successfully';
end $$;