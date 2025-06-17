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
drop policy if exists "Media content is publicly accessible" on storage.objects;
drop policy if exists "Users can upload media content" on storage.objects;
drop policy if exists "Users can update their own media content" on storage.objects;
drop policy if exists "Users can delete their own media content" on storage.objects;

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

-- Grant permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;

-- Force schema cache refresh
notify pgrst, 'reload schema';