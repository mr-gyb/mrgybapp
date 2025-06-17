-- Drop existing media bucket if it exists
do $$
begin
  if exists (
    select 1 from storage.buckets where id = 'media-content'
  ) then
    delete from storage.objects where bucket_id = 'media-content';
    delete from storage.buckets where id = 'media-content';
  end if;
end $$;

-- Create media bucket with proper configuration
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-content',
  'Media Content',
  true,
  52428800, -- 50MB limit
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
);

-- Enable RLS
alter table storage.objects enable row level security;

-- Update storage policies
create policy "Media content is publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'media-content' );

create policy "Users can upload media content"
  on storage.objects for insert
  with check (
    bucket_id = 'media-content'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own media content"
  on storage.objects for update
  using (
    bucket_id = 'media-content'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own media content"
  on storage.objects for delete
  using (
    bucket_id = 'media-content'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verify media_content table exists and has correct structure
create table if not exists public.media_content (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    title text,
    description text,
    content_type text not null,
    original_url text,
    storage_path text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Verify media_derivatives table exists
create table if not exists public.media_derivatives (
    id uuid default gen_random_uuid() primary key,
    media_id uuid references public.media_content on delete cascade not null,
    derivative_type text not null,
    content text,
    storage_path text,
    metadata jsonb default '{}'::jsonb,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tables
alter table public.media_content enable row level security;
alter table public.media_derivatives enable row level security;

-- Update table policies
create policy "Users can view their own media content"
  on media_content for select
  using (auth.uid() = user_id);

create policy "Users can insert their own media content"
  on media_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own media content"
  on media_content for update
  using (auth.uid() = user_id);

create policy "Users can delete their own media content"
  on media_content for delete
  using (auth.uid() = user_id);

create policy "Users can view their media derivatives"
  on media_derivatives for select
  using (
    exists (
      select 1 from media_content
      where media_content.id = media_derivatives.media_id
      and media_content.user_id = auth.uid()
    )
  );

-- Grant permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;
grant all on media_content to authenticated;
grant all on media_derivatives to authenticated;

-- Force schema cache refresh
notify pgrst, 'reload schema';