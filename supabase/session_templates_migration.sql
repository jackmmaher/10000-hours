-- 10,000 Hours - Session Templates & Courses Migration
-- Run this in Supabase SQL editor to add community session features

-- ===========================================
-- COURSES (must be created first for FK reference)
-- ===========================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  session_count int not null default 0,
  difficulty text default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  karma int default 0,
  saves int default 0,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

-- Anyone can view courses
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

-- Only admins/system can create courses (seed data)
-- For now, allow authenticated users to create courses
create policy "Authenticated users can create courses"
  on public.courses for insert
  with check (auth.uid() is not null);

create index courses_created_at_idx on public.courses(created_at desc);
create index courses_karma_idx on public.courses(karma desc);

-- ===========================================
-- SESSION TEMPLATES
-- ===========================================

create table if not exists public.session_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,  -- null for system/seeded content
  title text not null,
  tagline text not null,
  hero_gradient text default 'from-emerald-400 to-teal-600',
  duration_guidance text not null default '15-20 mins',
  discipline text not null check (discipline in (
    'Breath Awareness', 'Vipassana', 'Loving-Kindness', 'Body Scan',
    'Zen/Zazen', 'Mantra', 'Open Awareness', 'Walking Meditation'
  )),
  posture text not null check (posture in (
    'Seated (cushion)', 'Seated (chair)', 'Lotus', 'Half-lotus',
    'Lying down', 'Walking', 'Standing'
  )),
  best_time text not null default 'Anytime' check (best_time in (
    'Morning', 'Midday', 'Evening', 'Before sleep', 'Anytime'
  )),
  environment text,
  guidance_notes text not null,
  intention text not null,
  recommended_after_hours int default 0,
  tags text[] default '{}',
  karma int default 0,
  saves int default 0,
  completions int default 0,
  creator_hours int default 0,  -- Creator's logged hours at time of creation
  course_id uuid references public.courses(id) on delete set null,
  course_position int,
  created_at timestamptz default now()
);

alter table public.session_templates enable row level security;

-- Anyone can view session templates
create policy "Anyone can view session templates"
  on public.session_templates for select
  using (true);

-- Authenticated users can create templates
create policy "Authenticated users can create templates"
  on public.session_templates for insert
  with check (auth.uid() is not null);

-- Users can delete their own templates
create policy "Users can delete own templates"
  on public.session_templates for delete
  using (auth.uid() = user_id);

-- Indexes for efficient queries
create index session_templates_created_at_idx on public.session_templates(created_at desc);
create index session_templates_karma_idx on public.session_templates(karma desc);
create index session_templates_discipline_idx on public.session_templates(discipline);
create index session_templates_course_id_idx on public.session_templates(course_id);
create index session_templates_tags_idx on public.session_templates using gin(tags);

-- ===========================================
-- SESSION TEMPLATE VOTES
-- ===========================================

create table if not exists public.session_template_votes (
  template_id uuid references public.session_templates(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (template_id, user_id)
);

alter table public.session_template_votes enable row level security;

create policy "Users can view own template votes"
  on public.session_template_votes for select
  using (auth.uid() = user_id);

create policy "Users can create template votes"
  on public.session_template_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own template votes"
  on public.session_template_votes for delete
  using (auth.uid() = user_id);

-- ===========================================
-- SESSION TEMPLATE SAVES
-- ===========================================

create table if not exists public.session_template_saves (
  template_id uuid references public.session_templates(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (template_id, user_id)
);

alter table public.session_template_saves enable row level security;

create policy "Users can view own template saves"
  on public.session_template_saves for select
  using (auth.uid() = user_id);

create policy "Users can create template saves"
  on public.session_template_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own template saves"
  on public.session_template_saves for delete
  using (auth.uid() = user_id);

-- ===========================================
-- SESSION TEMPLATE COMPLETIONS
-- ===========================================

create table if not exists public.session_template_completions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.session_templates(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  session_uuid text,  -- Reference to local session
  completed_at timestamptz default now()
);

alter table public.session_template_completions enable row level security;

create policy "Users can view own completions"
  on public.session_template_completions for select
  using (auth.uid() = user_id);

create policy "Users can create completions"
  on public.session_template_completions for insert
  with check (auth.uid() = user_id);

create index template_completions_user_idx on public.session_template_completions(user_id, completed_at desc);
create index template_completions_template_idx on public.session_template_completions(template_id);

-- ===========================================
-- COURSE VOTES & SAVES
-- ===========================================

create table if not exists public.course_votes (
  course_id uuid references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (course_id, user_id)
);

alter table public.course_votes enable row level security;

create policy "Users can view own course votes"
  on public.course_votes for select
  using (auth.uid() = user_id);

create policy "Users can create course votes"
  on public.course_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own course votes"
  on public.course_votes for delete
  using (auth.uid() = user_id);

create table if not exists public.course_saves (
  course_id uuid references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (course_id, user_id)
);

alter table public.course_saves enable row level security;

create policy "Users can view own course saves"
  on public.course_saves for select
  using (auth.uid() = user_id);

create policy "Users can create course saves"
  on public.course_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own course saves"
  on public.course_saves for delete
  using (auth.uid() = user_id);

-- ===========================================
-- PEARL-SESSION LINKS (social proof)
-- ===========================================

create table if not exists public.pearl_session_links (
  pearl_id uuid references public.pearls(id) on delete cascade,
  template_id uuid references public.session_templates(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, template_id)
);

alter table public.pearl_session_links enable row level security;

-- Anyone can view pearl-session links
create policy "Anyone can view pearl session links"
  on public.pearl_session_links for select
  using (true);

-- System/admin can create links
create policy "Authenticated users can create pearl session links"
  on public.pearl_session_links for insert
  with check (auth.uid() is not null);

-- ===========================================
-- TRIGGERS FOR SESSION TEMPLATE COUNTS
-- ===========================================

-- Increment karma when template voted
create or replace function increment_template_karma()
returns trigger as $$
begin
  update public.session_templates set karma = karma + 1 where id = NEW.template_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_template_vote_added
  after insert on public.session_template_votes
  for each row execute function increment_template_karma();

-- Decrement karma when vote removed
create or replace function decrement_template_karma()
returns trigger as $$
begin
  update public.session_templates set karma = greatest(0, karma - 1) where id = OLD.template_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_template_vote_removed
  after delete on public.session_template_votes
  for each row execute function decrement_template_karma();

-- Increment saves when template saved
create or replace function increment_template_saves()
returns trigger as $$
begin
  update public.session_templates set saves = saves + 1 where id = NEW.template_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_template_save_added
  after insert on public.session_template_saves
  for each row execute function increment_template_saves();

-- Decrement saves when template unsaved
create or replace function decrement_template_saves()
returns trigger as $$
begin
  update public.session_templates set saves = greatest(0, saves - 1) where id = OLD.template_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_template_save_removed
  after delete on public.session_template_saves
  for each row execute function decrement_template_saves();

-- Increment completions when session completed
create or replace function increment_template_completions()
returns trigger as $$
begin
  update public.session_templates set completions = completions + 1 where id = NEW.template_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_template_completion_added
  after insert on public.session_template_completions
  for each row execute function increment_template_completions();

-- ===========================================
-- TRIGGERS FOR COURSE COUNTS
-- ===========================================

-- Update course session_count when templates added/removed
create or replace function update_course_session_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.course_id is not null then
    update public.courses set session_count = (
      select count(*) from public.session_templates where course_id = NEW.course_id
    ) where id = NEW.course_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.course_id is not null then
      update public.courses set session_count = (
        select count(*) from public.session_templates where course_id = OLD.course_id
      ) where id = OLD.course_id;
    end if;
    if NEW.course_id is not null then
      update public.courses set session_count = (
        select count(*) from public.session_templates where course_id = NEW.course_id
      ) where id = NEW.course_id;
    end if;
  elsif TG_OP = 'DELETE' and OLD.course_id is not null then
    update public.courses set session_count = (
      select count(*) from public.session_templates where course_id = OLD.course_id
    ) where id = OLD.course_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_template_course_change
  after insert or update or delete on public.session_templates
  for each row execute function update_course_session_count();

-- Course karma triggers
create or replace function increment_course_karma()
returns trigger as $$
begin
  update public.courses set karma = karma + 1 where id = NEW.course_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_course_vote_added
  after insert on public.course_votes
  for each row execute function increment_course_karma();

create or replace function decrement_course_karma()
returns trigger as $$
begin
  update public.courses set karma = greatest(0, karma - 1) where id = OLD.course_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_course_vote_removed
  after delete on public.course_votes
  for each row execute function decrement_course_karma();

-- Course saves triggers
create or replace function increment_course_saves()
returns trigger as $$
begin
  update public.courses set saves = saves + 1 where id = NEW.course_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_course_save_added
  after insert on public.course_saves
  for each row execute function increment_course_saves();

create or replace function decrement_course_saves()
returns trigger as $$
begin
  update public.courses set saves = greatest(0, saves - 1) where id = OLD.course_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_course_save_removed
  after delete on public.course_saves
  for each row execute function decrement_course_saves();

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Get session templates with user's vote/save status
create or replace function get_session_templates_for_user(
  p_user_id uuid,
  p_filter text default 'new',
  p_discipline text default null,
  p_difficulty text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  title text,
  tagline text,
  hero_gradient text,
  duration_guidance text,
  discipline text,
  posture text,
  best_time text,
  environment text,
  guidance_notes text,
  intention text,
  recommended_after_hours int,
  tags text[],
  karma int,
  saves int,
  completions int,
  creator_hours int,
  course_id uuid,
  course_position int,
  created_at timestamptz,
  has_voted boolean,
  has_saved boolean,
  has_completed boolean
) as $$
begin
  return query
  select
    t.id,
    t.user_id,
    t.title,
    t.tagline,
    t.hero_gradient,
    t.duration_guidance,
    t.discipline,
    t.posture,
    t.best_time,
    t.environment,
    t.guidance_notes,
    t.intention,
    t.recommended_after_hours,
    t.tags,
    t.karma,
    t.saves,
    t.completions,
    t.creator_hours,
    t.course_id,
    t.course_position,
    t.created_at,
    exists(select 1 from public.session_template_votes v where v.template_id = t.id and v.user_id = p_user_id) as has_voted,
    exists(select 1 from public.session_template_saves s where s.template_id = t.id and s.user_id = p_user_id) as has_saved,
    exists(select 1 from public.session_template_completions c where c.template_id = t.id and c.user_id = p_user_id) as has_completed
  from public.session_templates t
  where
    (p_discipline is null or t.discipline = p_discipline) and
    (p_difficulty is null or (
      (p_difficulty = 'beginner' and t.recommended_after_hours < 10) or
      (p_difficulty = 'intermediate' and t.recommended_after_hours >= 10 and t.recommended_after_hours < 100) or
      (p_difficulty = 'advanced' and t.recommended_after_hours >= 100)
    ))
  order by
    case when p_filter = 'top' then t.karma else 0 end desc,
    case when p_filter = 'rising' then t.karma::float / greatest(1, extract(epoch from (now() - t.created_at)) / 3600) else 0 end desc,
    case when p_filter = 'most_saved' then t.saves else 0 end desc,
    t.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;

-- Get pearls linked to a session template (social proof)
create or replace function get_pearls_for_template(
  p_template_id uuid,
  p_limit int default 5
)
returns table (
  id uuid,
  text text,
  upvotes int,
  created_at timestamptz
) as $$
begin
  return query
  select
    p.id,
    p.text,
    p.upvotes,
    p.created_at
  from public.pearls p
  inner join public.pearl_session_links l on l.pearl_id = p.id
  where l.template_id = p_template_id
  order by p.upvotes desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Get courses with user's vote/save status
create or replace function get_courses_for_user(
  p_user_id uuid,
  p_filter text default 'new',
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  title text,
  description text,
  session_count int,
  difficulty text,
  karma int,
  saves int,
  created_at timestamptz,
  has_voted boolean,
  has_saved boolean
) as $$
begin
  return query
  select
    c.id,
    c.title,
    c.description,
    c.session_count,
    c.difficulty,
    c.karma,
    c.saves,
    c.created_at,
    exists(select 1 from public.course_votes v where v.course_id = c.id and v.user_id = p_user_id) as has_voted,
    exists(select 1 from public.course_saves s where s.course_id = c.id and s.user_id = p_user_id) as has_saved
  from public.courses c
  order by
    case when p_filter = 'top' then c.karma else 0 end desc,
    case when p_filter = 'most_saved' then c.saves else 0 end desc,
    c.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;
