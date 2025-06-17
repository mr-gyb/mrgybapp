-- Create roadmap_progress table
create table if not exists public.roadmap_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    phase_id text not null,
    milestone_id text not null,
    completed boolean default false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, phase_id, milestone_id)
);

-- Create roadmap_phases table for storing 4Cs phases
create table if not exists public.roadmap_phases (
    id text primary key,
    title text not null,
    description text,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create roadmap_milestones table
create table if not exists public.roadmap_milestones (
    id text primary key,
    phase_id text references public.roadmap_phases(id) on delete cascade,
    title text not null,
    description text,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.roadmap_progress enable row level security;
alter table public.roadmap_phases enable row level security;
alter table public.roadmap_milestones enable row level security;

-- Create policies
create policy "Users can view their own progress"
  on roadmap_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on roadmap_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on roadmap_progress for update
  using (auth.uid() = user_id);

create policy "Public phases are viewable by everyone"
  on roadmap_phases for select
  using (true);

create policy "Public milestones are viewable by everyone"
  on roadmap_milestones for select
  using (true);

-- Create indexes
create index roadmap_progress_user_id_idx on public.roadmap_progress(user_id);
create index roadmap_progress_phase_id_idx on public.roadmap_progress(phase_id);
create index roadmap_milestones_phase_id_idx on public.roadmap_milestones(phase_id);

-- Insert default 4Cs phases
insert into public.roadmap_phases (id, title, description, order_index) values
('culture', 'Culture', 'Build your brand identity and values', 1),
('content', 'Content', 'Create valuable content for your audience', 2),
('community', 'Community', 'Build and engage with your community', 3),
('commerce', 'Commerce', 'Monetize your passion', 4)
on conflict (id) do nothing;

-- Insert default milestones for each phase
insert into public.roadmap_milestones (id, phase_id, title, description, order_index) values
-- Culture phase milestones
('culture-1', 'culture', 'Define Brand Identity', 'Create your vision and mission statements', 1),
('culture-2', 'culture', 'Establish Core Values', 'Define your brand personality and values', 2),
('culture-3', 'culture', 'Visual Identity', 'Design logo, choose colors, and create brand guidelines', 3),
('culture-4', 'culture', 'Target Audience', 'Define your ideal customer profile', 4),

-- Content phase milestones
('content-1', 'content', 'Content Strategy', 'Develop your content strategy and calendar', 1),
('content-2', 'content', 'Content Creation', 'Start creating valuable content', 2),
('content-3', 'content', 'Content Distribution', 'Choose and optimize distribution channels', 3),
('content-4', 'content', 'Content Analytics', 'Track and analyze content performance', 4),

-- Community phase milestones
('community-1', 'community', 'Community Platform', 'Set up your community platforms', 1),
('community-2', 'community', 'Engagement Strategy', 'Create engagement guidelines and strategy', 2),
('community-3', 'community', 'Community Growth', 'Implement growth tactics', 3),
('community-4', 'community', 'Community Management', 'Establish management processes', 4),

-- Commerce phase milestones
('commerce-1', 'commerce', 'Business Model', 'Define your revenue streams', 1),
('commerce-2', 'commerce', 'Pricing Strategy', 'Set up pricing and packages', 2),
('commerce-3', 'commerce', 'Sales Funnel', 'Create your sales process', 3),
('commerce-4', 'commerce', 'Growth Strategy', 'Plan for scaling revenue', 4)
on conflict (id) do nothing;

-- Create updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_roadmap_progress_updated_at
  before update on public.roadmap_progress
  for each row
  execute function public.handle_updated_at();

create trigger handle_roadmap_phases_updated_at
  before update on public.roadmap_phases
  for each row
  execute function public.handle_updated_at();

create trigger handle_roadmap_milestones_updated_at
  before update on public.roadmap_milestones
  for each row
  execute function public.handle_updated_at();

-- Grant permissions
grant usage on schema public to authenticated;
grant all on roadmap_progress to authenticated;
grant select on roadmap_phases to authenticated;
grant select on roadmap_milestones to authenticated;

-- Force schema cache refresh
notify pgrst, 'reload schema';