-- Create invites table to track invitation attempts
create table if not exists public.invites (
  id bigserial primary key,
  email text not null,
  role text not null default 'PARENT',
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on email for faster lookups
create index if not exists invites_email_idx on public.invites(email);

-- Enable RLS
alter table public.invites enable row level security;

-- Add RLS policy for super_admin to view all invites
create policy "Super admin can view all invites" on public.invites
  for select using (
    auth.jwt() ->> 'role' = 'SUPER_ADMIN'
  );

-- Add RLS policy for inserting invites (for server-side only via service role)
create policy "Service role can insert invites" on public.invites
  for insert with check (true);
