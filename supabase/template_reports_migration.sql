-- 10,000 Hours - Template Reports Migration
-- Run this in Supabase SQL editor to add content moderation features

-- ===========================================
-- TEMPLATE REPORTS
-- ===========================================

create table if not exists public.template_reports (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.session_templates(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,  -- Required explanation of the issue
  status text default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.template_reports enable row level security;

-- Anyone authenticated can create a report
create policy "Authenticated users can create reports"
  on public.template_reports for insert
  with check (auth.uid() is not null);

-- Users can view their own reports
create policy "Users can view own reports"
  on public.template_reports for select
  using (auth.uid() = reporter_id);

-- Indexes for efficient queries
create index template_reports_template_idx on public.template_reports(template_id);
create index template_reports_status_idx on public.template_reports(status);
create index template_reports_created_at_idx on public.template_reports(created_at desc);

-- ===========================================
-- HELPER FUNCTION: Check if template has pending reports
-- ===========================================

create or replace function has_pending_reports(p_template_id uuid)
returns boolean as $$
begin
  return exists(
    select 1 from public.template_reports
    where template_id = p_template_id and status = 'pending'
  );
end;
$$ language plpgsql security definer;
