-- ===========================================
-- 10,000 HOURS - SESSION TEMPLATE TRIGGERS
-- ===========================================
-- Run this in Supabase SQL Editor to add the missing triggers
-- These enable automatic karma/saves/completions counting
-- ===========================================

-- Increment karma when template voted
create or replace function increment_template_karma()
returns trigger as $$
begin
  update public.session_templates set karma = karma + 1 where id = NEW.template_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_template_vote_added on public.session_template_votes;
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

drop trigger if exists on_template_vote_removed on public.session_template_votes;
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

drop trigger if exists on_template_save_added on public.session_template_saves;
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

drop trigger if exists on_template_save_removed on public.session_template_saves;
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

drop trigger if exists on_template_completion_added on public.session_template_completions;
create trigger on_template_completion_added
  after insert on public.session_template_completions
  for each row execute function increment_template_completions();

-- ===========================================
-- VERIFY TRIGGERS CREATED
-- ===========================================
select
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgtype as trigger_type
from pg_trigger
where tgname like 'on_template%'
order by tgname;
