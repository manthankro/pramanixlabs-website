-- PramanixLabs migration 002
-- Adds accessible portfolio image metadata, updated_at maintenance, query
-- indexes and the deletion policy the studio needs for inquiry retention.
-- Also aligns the seeded project copy with the public site.

begin;

alter table public.projects add column if not exists image_alt text;

comment on column public.projects.image_alt is
  'Alternative text shown to screen readers when the portfolio image is displayed.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);
create index if not exists projects_sort_order_idx
  on public.projects (sort_order);

-- Retention: allowlisted admins may remove old inquiry records.
drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (public.is_site_admin());

grant delete on public.inquiries to authenticated;

-- Keep the seeded rows in step with src/data/content.ts. Any later edits made
-- in the studio dashboard are preserved until this migration is applied.
update public.projects as p
set
  name = v.name,
  category = v.category,
  description = v.description,
  status = v.status,
  upcoming = v.upcoming,
  sort_order = v.sort_order
from (
  values
    (
      '01',
      'Restovra',
      'Cyber resilience',
      'A self-hosted recovery assurance workbench. It turns authorised database backups into reviewed recovery drills and evidence teams can inspect.',
      'In development',
      false,
      1
    ),
    (
      '02',
      'KavachScan',
      'Cybersecurity',
      'A consent-first, read-only website security checker for small businesses in India. It turns selected public website and email settings into plain-language observations and practical next steps.',
      'Controlled evaluation',
      false,
      2
    ),
    (
      '03',
      'Pramanix AI',
      'AI learning',
      'An AI engineering mentor and capstone companion exploring project architecture, software concepts, debugging and viva preparation for engineering students.',
      'Public repository',
      false,
      3
    ),
    (
      '04',
      'SECOND LIFE ID',
      'Digital identity',
      'An early-stage identity concept in the PramanixLabs portfolio. Scope and product details are still being explored and will be shared once they are defined.',
      'In exploration',
      true,
      4
    ),
    (
      '05',
      'Pramanix Shelf / Reading Room',
      'Digital learning',
      'A reading and learning experience in early exploration. The shape of the product is still being worked out before anything is claimed about it.',
      'In exploration',
      true,
      5
    )
) as v(id, name, category, description, status, upcoming, sort_order)
where p.id = v.id;

commit;
