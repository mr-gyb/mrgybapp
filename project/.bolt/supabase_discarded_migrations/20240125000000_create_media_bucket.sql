-- Create media storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media-content', 'Media Content', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Create storage policies for media bucket
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

-- Grant necessary permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;