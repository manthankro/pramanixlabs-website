-- Apply with `supabase db push`. Create admin accounts from the Supabase dashboard,
-- then add their auth user UUIDs to admin_users. Public registration is not used.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- Required: without RLS the authenticated grants below would expose the allowlist.
-- Migration 003 also enables this for projects that applied 001 before the fix.
alter table public.admin_users enable row level security;
create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null check (char_length(topic) between 1 and 120),
  message text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create policy "Admins can read inquiries" on public.inquiries for select to authenticated using (public.is_site_admin());

create table if not exists public.inquiry_rate_limits (
  ip_hash text primary key,
  window_start timestamptz not null,
  requests integer not null check (requests > 0)
);
alter table public.inquiry_rate_limits enable row level security;
create or replace function public.claim_inquiry_slot(p_ip_hash text, p_now timestamptz default now())
returns boolean language plpgsql security definer set search_path = public
as $$
declare request_count integer;
begin
  insert into public.inquiry_rate_limits(ip_hash,window_start,requests) values (p_ip_hash,p_now,1)
  on conflict (ip_hash) do update set
    window_start = case when public.inquiry_rate_limits.window_start < p_now - interval '15 minutes' then p_now else public.inquiry_rate_limits.window_start end,
    requests = case when public.inquiry_rate_limits.window_start < p_now - interval '15 minutes' then 1 else public.inquiry_rate_limits.requests + 1 end
  returning requests into request_count;
  return request_count <= 5;
end;
$$;
revoke all on function public.claim_inquiry_slot(text,timestamptz) from public, anon, authenticated;
grant execute on function public.claim_inquiry_slot(text,timestamptz) to service_role;

create table if not exists public.projects (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  status text not null default 'Project',
  upcoming boolean not null default false,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "Published projects are readable" on public.projects for select to anon, authenticated using (true);
create policy "Admins manage projects" on public.projects for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

insert into public.projects (id,name,category,description,status,upcoming,sort_order) values
('01','Restovra','Cyber resilience','A self-hosted recovery assurance workbench. It turns authorised database backups into reviewed recovery drills and evidence teams can inspect.','In development',false,1),
('02','KavachScan','Cybersecurity','A security project from the PramanixLabs portfolio. Follow the source repository for its current scope and implementation details.','Project',false,2),
('03','Pramanix AI','Applied AI','An AI project in the PramanixLabs portfolio. The public source provides the most current view of its implementation.','Project',false,3),
('04','SECOND LIFE ID','Digital identity','An upcoming project in the PramanixLabs product portfolio. Further product details will be shared as the concept develops.','Upcoming innovation',true,4),
('05','Pramanix Shelf / Reading Room','Digital learning','A planned reading and learning experience in the PramanixLabs portfolio. More information will follow as the project takes shape.','Upcoming innovation',true,5)
on conflict (id) do nothing;

-- Public reads are limited to intentional portfolio assets. Only site admins can upload,
-- update or remove objects from this bucket.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Portfolio assets are public" on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio-media');
create policy "Admins upload portfolio assets" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_site_admin());
create policy "Admins update portfolio assets" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and public.is_site_admin()) with check (bucket_id = 'portfolio-media' and public.is_site_admin());
create policy "Admins remove portfolio assets" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_site_admin());

grant insert on public.inquiries to service_role;
grant select on public.inquiries to authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select, insert, delete on public.admin_users to authenticated;
create policy "Admins manage admin users" on public.admin_users for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
