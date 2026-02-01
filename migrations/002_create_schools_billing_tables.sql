-- Create schools table
create table if not exists public.schools (
  id bigserial primary key,
  name text not null unique,
  location text,
  principal_name text,
  principal_email text,
  phone_number text,
  subscription_tier text default 'Starter' check (subscription_tier in ('Starter', 'Growth', 'Professional', 'Enterprise')),
  account_status text default 'Trial' check (account_status in ('Trial', 'Active', 'Suspended')),
  child_count int default 0,
  teacher_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id bigserial primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  tier text not null check (tier in ('Starter', 'Growth', 'Professional', 'Enterprise')),
  monthly_price_zar numeric(10, 2) not null,
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  billing_status text default 'Trial' check (billing_status in ('Trial', 'Active', 'Past Due')),
  auto_renew boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create add_ons table
create table if not exists public.add_ons (
  id bigserial primary key,
  subscription_id bigint not null references public.subscriptions(id) on delete cascade,
  add_on_name text not null check (add_on_name in ('photo_packs', 'sms_alerts', 'analytics', 'api_access')),
  monthly_price_zar numeric(10, 2) not null,
  enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create invoices table
create table if not exists public.invoices (
  id bigserial primary key,
  school_id bigint not null references public.schools(id) on delete cascade,
  subscription_id bigint references public.subscriptions(id) on delete set null,
  amount_zar numeric(10, 2) not null,
  invoice_date timestamp with time zone default now(),
  due_date timestamp with time zone,
  paid_date timestamp with time zone,
  status text default 'Pending' check (status in ('Pending', 'Paid', 'Overdue')),
  invoice_number text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create impersonation_log table for audit trail
create table if not exists public.impersonation_logs (
  id bigserial primary key,
  super_admin_user_id uuid not null references auth.users(id) on delete cascade,
  school_id bigint not null references public.schools(id) on delete cascade,
  session_start timestamp with time zone default now(),
  session_end timestamp with time zone,
  actions_taken text,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists schools_subscription_tier_idx on public.schools(subscription_tier);
create index if not exists schools_account_status_idx on public.schools(account_status);
create index if not exists subscriptions_school_id_idx on public.subscriptions(school_id);
create index if not exists add_ons_subscription_id_idx on public.add_ons(subscription_id);
create index if not exists invoices_school_id_idx on public.invoices(school_id);
create index if not exists impersonation_logs_super_admin_id_idx on public.impersonation_logs(super_admin_user_id);
create index if not exists impersonation_logs_school_id_idx on public.impersonation_logs(school_id);

-- Enable RLS on all tables
alter table public.schools enable row level security;
alter table public.subscriptions enable row level security;
alter table public.add_ons enable row level security;
alter table public.invoices enable row level security;
alter table public.impersonation_logs enable row level security;

-- RLS Policies for super_admin access only

-- Schools
create policy "Super admin can view all schools" on public.schools
  for select using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

create policy "Super admin can update schools" on public.schools
  for update using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

-- Subscriptions
create policy "Super admin can view all subscriptions" on public.subscriptions
  for select using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

-- Add-ons
create policy "Super admin can view all add_ons" on public.add_ons
  for select using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

-- Invoices
create policy "Super admin can view all invoices" on public.invoices
  for select using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

-- Impersonation logs
create policy "Super admin can view all impersonation logs" on public.impersonation_logs
  for select using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

create policy "Super admin can insert impersonation logs" on public.impersonation_logs
  for insert with check (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

create policy "Super admin can update impersonation logs" on public.impersonation_logs
  for update using (auth.jwt() ->> 'role' = 'SUPER_ADMIN');
