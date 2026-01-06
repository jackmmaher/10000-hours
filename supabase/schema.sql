-- 10,000 Hours Meditation App - Supabase Schema
-- Run this in the Supabase SQL editor to set up the database

-- ===========================================
-- PROFILES
-- ===========================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now(),
  tier text default 'free' check (tier in ('free', 'premium')),
  total_karma int default 0,
  total_saves int default 0
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================
-- PEARLS
-- ===========================================

create table public.pearls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null check (char_length(text) <= 280),
  upvotes int default 0,
  saves int default 0,
  created_at timestamptz default now()
);

alter table public.pearls enable row level security;

-- Anyone can view pearls (public feed)
create policy "Anyone can view pearls"
  on public.pearls for select
  using (true);

-- Only authenticated users can create pearls
create policy "Authenticated users can create pearls"
  on public.pearls for insert
  with check (auth.uid() = user_id);

-- Users can delete their own pearls
create policy "Users can delete own pearls"
  on public.pearls for delete
  using (auth.uid() = user_id);

-- Index for feed queries
create index pearls_created_at_idx on public.pearls(created_at desc);
create index pearls_upvotes_idx on public.pearls(upvotes desc);

-- ===========================================
-- VOTES
-- ===========================================

create table public.pearl_votes (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_votes enable row level security;

create policy "Users can view own votes"
  on public.pearl_votes for select
  using (auth.uid() = user_id);

create policy "Users can create votes"
  on public.pearl_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.pearl_votes for delete
  using (auth.uid() = user_id);

-- ===========================================
-- SAVES
-- ===========================================

create table public.pearl_saves (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_saves enable row level security;

create policy "Users can view own saves"
  on public.pearl_saves for select
  using (auth.uid() = user_id);

create policy "Users can create saves"
  on public.pearl_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saves"
  on public.pearl_saves for delete
  using (auth.uid() = user_id);

-- ===========================================
-- TRIGGERS FOR COUNTS
-- ===========================================

-- Increment upvotes when vote added
create or replace function increment_pearl_upvotes()
returns trigger as $$
begin
  update public.pearls set upvotes = upvotes + 1 where id = NEW.pearl_id;
  update public.profiles set total_karma = total_karma + 1
    where id = (select user_id from public.pearls where id = NEW.pearl_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_vote_added
  after insert on public.pearl_votes
  for each row execute function increment_pearl_upvotes();

-- Decrement upvotes when vote removed
create or replace function decrement_pearl_upvotes()
returns trigger as $$
begin
  update public.pearls set upvotes = greatest(0, upvotes - 1) where id = OLD.pearl_id;
  update public.profiles set total_karma = greatest(0, total_karma - 1)
    where id = (select user_id from public.pearls where id = OLD.pearl_id);
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_vote_removed
  after delete on public.pearl_votes
  for each row execute function decrement_pearl_upvotes();

-- Increment saves when pearl saved
create or replace function increment_pearl_saves()
returns trigger as $$
begin
  update public.pearls set saves = saves + 1 where id = NEW.pearl_id;
  update public.profiles set total_saves = total_saves + 1
    where id = (select user_id from public.pearls where id = NEW.pearl_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_save_added
  after insert on public.pearl_saves
  for each row execute function increment_pearl_saves();

-- Decrement saves when pearl unsaved
create or replace function decrement_pearl_saves()
returns trigger as $$
begin
  update public.pearls set saves = greatest(0, saves - 1) where id = OLD.pearl_id;
  update public.profiles set total_saves = greatest(0, total_saves - 1)
    where id = (select user_id from public.pearls where id = OLD.pearl_id);
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_save_removed
  after delete on public.pearl_saves
  for each row execute function decrement_pearl_saves();

-- ===========================================
-- HELPER VIEWS
-- ===========================================

-- View for pearls with user's vote/save status
create or replace function get_pearls_for_user(
  p_user_id uuid,
  p_filter text default 'new',
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  text text,
  upvotes int,
  saves int,
  created_at timestamptz,
  has_voted boolean,
  has_saved boolean
) as $$
begin
  return query
  select
    p.id,
    p.user_id,
    p.text,
    p.upvotes,
    p.saves,
    p.created_at,
    exists(select 1 from public.pearl_votes v where v.pearl_id = p.id and v.user_id = p_user_id) as has_voted,
    exists(select 1 from public.pearl_saves s where s.pearl_id = p.id and s.user_id = p_user_id) as has_saved
  from public.pearls p
  order by
    case when p_filter = 'top' then p.upvotes else 0 end desc,
    case when p_filter = 'rising' then p.upvotes::float / greatest(1, extract(epoch from (now() - p.created_at)) / 3600) else 0 end desc,
    p.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;
