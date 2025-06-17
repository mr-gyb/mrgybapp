-- Create chat-uploads bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('chat-uploads', 'Chat Uploads', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;

-- Create new policies
create policy "Public read access for chat uploads"
  on storage.objects for select
  using ( bucket_id = 'chat-uploads' );

create policy "Authenticated users can upload chat files"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-uploads'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own chat files"
  on storage.objects for update
  using (
    bucket_id = 'chat-uploads'
    and auth.uid() = owner
  );

create policy "Users can delete their own chat files"
  on storage.objects for delete
  using (
    bucket_id = 'chat-uploads'
    and auth.uid() = owner
  );

-- Grant necessary permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;