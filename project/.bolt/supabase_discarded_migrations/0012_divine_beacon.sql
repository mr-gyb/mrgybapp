-- Create content tables for analysis
create table if not exists public.content_analysis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  original_content text not null,
  content_type text not null check (content_type in ('text', 'image', 'video', 'audio', 'document')),
  storage_path text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.content_derivatives (
  id uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.content_analysis on delete cascade not null,
  derivative_type text not null check (derivative_type in ('blog', 'headline', 'summary', 'seo_tags')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Create content-uploads bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-uploads',
  'Content Uploads',
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
) on conflict (id) do nothing;

-- Enable RLS
alter table public.content_analysis enable row level security;
alter table public.content_derivatives enable row level security;

-- Create policies
create policy "Users can view their own content"
  on content_analysis for select
  using (auth.uid() = user_id);

create policy "Users can insert their own content"
  on content_analysis for insert
  with check (auth.uid() = user_id);

create policy "Users can view their content derivatives"
  on content_derivatives for select
  using (
    exists (
      select 1 from content_analysis
      where content_analysis.id = content_derivatives.analysis_id
      and content_analysis.user_id = auth.uid()
    )
  );

-- Create storage policies
create policy "Users can upload content files"
  on storage.objects for insert
  with check (
    bucket_id = 'content-uploads'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can access content files"
  on storage.objects for select
  using (bucket_id = 'content-uploads');

-- Grant permissions
grant usage on schema public to authenticated;
grant all on content_analysis to authenticated;
grant all on content_derivatives to authenticated;