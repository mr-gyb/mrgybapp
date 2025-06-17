-- Add dark_mode column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists dark_mode boolean default false;

-- Force schema cache refresh
notify pgrst, 'reload schema';

-- Verify the column exists
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'dark_mode'
  ) then
    raise exception 'dark_mode column is missing';
  end if;
end $$;