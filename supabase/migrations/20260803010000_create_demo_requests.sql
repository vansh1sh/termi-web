create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  details text check (details is null or char_length(details) <= 2000),
  source text not null default 'termi-web' check (char_length(source) <= 50),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

revoke all on table public.demo_requests from anon, authenticated;
revoke all on table public.demo_requests from service_role;
grant insert on table public.demo_requests to service_role;

create index if not exists demo_requests_created_at_idx
  on public.demo_requests (created_at desc);
