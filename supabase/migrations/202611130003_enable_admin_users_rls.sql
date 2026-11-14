-- PramanixLabs migration 003
--
-- Migration 001 created the admin allowlist and its policy but did not enable
-- row-level security on the table. With `authenticated` holding SELECT, INSERT
-- and DELETE grants, any signed-in account could read the allowlist or add
-- itself as an administrator. This migration closes that gap.
--
-- RLS is enabled without FORCE so the table owner and the service role can
-- still bootstrap the first administrator from the Supabase SQL editor.

begin;

alter table public.admin_users enable row level security;

-- Belt and braces: no anonymous access to the allowlist, whatever grants exist.
revoke all on public.admin_users from anon;

commit;
