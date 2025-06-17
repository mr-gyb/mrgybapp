-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create media_content table
create table if not exists public.media_content (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text,
    description text,
    content_type text not null check (content_type in ('video', 'audio', 'image', 'document', 'link')),
    original_url text,
    storage_path text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create media_transcriptions table
create table if not exists public.media_transcriptions (
    id uuid default uuid_generate_v4() primary key,
    media_id uuid references public.media_content on delete cascade not null,
    content text not null,
    language text default 'en',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create media_derivatives table for AI-generated content
create table if not exists public.media_derivatives (
    id uuid default uuid_generate_v4() primary key,
    media_id uuid references public.media_content on delete cascade not null,
    derivative_type text not null check (derivative_type in ('blog', 'summary', 'headline', 'seo_tags', 'audio', 'video', 'image')),
    content text,
    storage_path text,
    metadata jsonb default '{}'::jsonb,
    status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create media_tags table
create table if not exists public.media_tags (
    id uuid default uuid_generate_v4() primary key,
    media_id uuid references public.media_content on delete cascade not null,
    tag text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.media_content enable row level security;
alter table public.media_transcriptions enable row level security;
alter table public.media_derivatives enable row level security;
alter table public.media_tags enable row level security;

-- Create policies
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

-- Transcriptions policies
create policy "Users can view transcriptions of their media"
    on media_transcriptions for select
    using (
        exists (
            select 1 from media_content
            where media_content.id = media_transcriptions.media_id
            and media_content.user_id = auth.uid()
        )
    );

-- Derivatives policies
create policy "Users can view derivatives of their media"
    on media_derivatives for select
    using (
        exists (
            select 1 from media_content
            where media_content.id = media_derivatives.media_id
            and media_content.user_id = auth.uid()
        )
    );

-- Tags policies
create policy "Users can view tags of their media"
    on media_tags for select
    using (
        exists (
            select 1 from media_content
            where media_content.id = media_tags.media_id
            and media_content.user_id = auth.uid()
        )
    );

-- Create indexes
create index media_content_user_id_idx on public.media_content(user_id);
create index media_content_content_type_idx on public.media_content(content_type);
create index media_transcriptions_media_id_idx on public.media_transcriptions(media_id);
create index media_derivatives_media_id_idx on public.media_derivatives(media_id);
create index media_derivatives_type_idx on public.media_derivatives(derivative_type);
create index media_tags_media_id_idx on public.media_tags(media_id);

-- Create media_storage bucket
insert into storage.buckets (id, name, public)
values ('media-content', 'Media Content', false)
on conflict (id) do nothing;

-- Create storage policies
create policy "Users can view their own media files"
    on storage.objects for select
    using (
        bucket_id = 'media-content' and
        (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can upload their own media files"
    on storage.objects for insert
    with check (
        bucket_id = 'media-content' and
        (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can update their own media files"
    on storage.objects for update
    using (
        bucket_id = 'media-content' and
        (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can delete their own media files"
    on storage.objects for delete
    using (
        bucket_id = 'media-content' and
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create trigger for updated_at
create trigger handle_media_content_updated_at
    before update on media_content
    for each row
    execute function handle_updated_at();

create trigger handle_media_derivatives_updated_at
    before update on media_derivatives
    for each row
    execute function handle_updated_at();