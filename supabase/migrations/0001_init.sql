-- KoldOps Outbound Engine — initial schema

-- ICP / positioning / voice config
create table icp_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  services text[] not null default '{}',
  positioning text,
  voice_notes text,
  company_size_min int,
  company_size_max int,
  revenue_stage text,
  target_titles text[] not null default '{}',
  target_geo text[] not null default '{US}',
  pain_points text[] not null default '{}',
  buying_triggers text[] not null default '{}',
  disqualifiers text[] not null default '{}',
  objections text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Companies sourced
create table accounts (
  id uuid primary key default gen_random_uuid(),
  icp_profile_id uuid not null references icp_profiles(id) on delete cascade,
  company_name text not null,
  domain text,
  size int,
  revenue_stage text,
  industry text,
  location text,
  research_summary text,
  source_provider text,
  created_at timestamptz not null default now()
);

-- People (contacts)
create type email_status as enum ('valid', 'invalid', 'catch_all', 'unknown');
create type phone_type as enum ('mobile', 'landline', 'unknown');
create type phone_status as enum ('valid', 'invalid', 'unknown');
create type qualification_status as enum ('pending', 'qualified', 'disqualified');

create table leads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  full_name text not null,
  title text,
  linkedin_url text,
  email text,
  email_status email_status not null default 'unknown',
  phone text,
  phone_type phone_type not null default 'unknown',
  phone_status phone_status not null default 'unknown',
  location text,
  qualification_status qualification_status not null default 'pending',
  disqualify_reason text,
  fit_score int,
  signal_why text,
  source_provider text,
  basis text,
  enriched_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enrichment job log (cost + status visibility)
create table enrichment_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  provider text not null,
  operation text not null,
  status text not null default 'pending',
  cost_usd numeric(10,4) default 0,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

-- Suppression / DNC
create table suppression (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('email', 'phone', 'domain')),
  value text not null,
  reason text,
  added_at timestamptz not null default now(),
  unique (type, value)
);

-- Qualified lists for handoff
create table lists (
  id uuid primary key default gen_random_uuid(),
  icp_profile_id uuid not null references icp_profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  exported_at timestamptz
);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  unique (list_id, lead_id)
);

-- Handoff records
create table handoffs (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  channel text not null check (channel in ('slack', 'csv')),
  summary text,
  created_at timestamptz not null default now()
);

-- Vendor credentials (stores env var name, NOT the secret)
create table vendor_credentials (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  key_ref text not null,
  enabled boolean not null default true
);

-- Indexes
create index idx_accounts_icp on accounts(icp_profile_id);
create index idx_leads_account on leads(account_id);
create index idx_leads_qualification on leads(qualification_status);
create index idx_enrichment_jobs_lead on enrichment_jobs(lead_id);
create index idx_enrichment_jobs_created on enrichment_jobs(created_at);
create index idx_list_items_list on list_items(list_id);
create index idx_suppression_value on suppression(type, value);

-- RLS: single-tenant, authenticated users get full access
alter table icp_profiles enable row level security;
alter table accounts enable row level security;
alter table leads enable row level security;
alter table enrichment_jobs enable row level security;
alter table suppression enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;
alter table handoffs enable row level security;
alter table vendor_credentials enable row level security;

create policy "Authenticated full access" on icp_profiles for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on accounts for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on leads for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on enrichment_jobs for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on suppression for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on lists for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on list_items for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on handoffs for all to authenticated using (true) with check (true);
create policy "Authenticated full access" on vendor_credentials for all to authenticated using (true) with check (true);
