# Security notes

## Data boundaries

| Asset | Who can read | Who can write |
| --- | --- | --- |
| Public site (static) | Anyone | Deploy pipeline only |
| `public.projects` | Anyone, including signed-out visitors | Users in `public.admin_users` |
| `public.inquiries` | Users in `public.admin_users` | `service_role` (Edge Function) inserts; admins may delete |
| `public.admin_users` | Admins (manage policy) | Admins |
| `storage` bucket `portfolio-media` | Anyone (images are public by design) | Admins only |
| Auth sessions | The signed-in user | Supabase Auth |
| Edge Function secrets | Function runtime | Project owner |

The browser bundle contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is public by design and grants nothing beyond what RLS allows. The service-role key exists only in the Edge Function runtime; it is never sent to a browser, never placed in `.env.example`, and must not appear in commits, screenshots or chat.

## Authentication and the admin allowlist

- Public sign-up is disabled in Supabase Auth. The dashboard has no registration form.
- `/admin` is not a security boundary by itself: it is a client route guarded by a session check plus an `is_site_admin()` RPC call. Real protection is row-level security on every table and storage policy.
- A user who authenticates but is not in `public.admin_users` sees the “no studio access” message and receives no rows from the database.
- `is_site_admin()` runs as `SECURITY DEFINER` with `search_path = public`, is revoked from `public`, and is granted only to `authenticated`.
- `public.admin_users` has row-level security enabled by migration 003. Without it, the authenticated grants would let any signed-in account read the allowlist or insert itself as an administrator. Never apply migration 001 without 003.
- Removing a UUID from `public.admin_users` revokes dashboard and data access immediately.

## Inquiry handling

- When Supabase is configured, submissions go through the `submit-inquiry` Edge Function. Without that configuration, the page uses a `mailto:` fallback and does not store inquiries in the database. The browser has no insert permission on `public.inquiries`.
- The function checks the exact origin against `SITE_ORIGIN`, rejects oversized payloads, validates name, email, topic and message, and silently accepts honeypot hits.
- A per-IP SHA-256 hash (salted with the service-role key) is stored in `public.inquiry_rate_limits`; five submissions per fifteen minutes are accepted. Only the hash is stored, not the raw IP.
- Inquiry content is never rendered as HTML: the dashboard and email body use plain text, and React escapes all displayed values.
- Email delivery is optional and server-side. A delivery failure does not lose the stored inquiry; the response reports `emailSent: false`.

## Portfolio storage

- Bucket `portfolio-media` is public and limited to JPEG, PNG, WebP and AVIF up to 5 MiB.
- Select is public; insert, update and delete are restricted to `public.is_site_admin()`.
- Upload paths include a timestamp and a random UUID, so replacing an image does not overwrite the old object. Remove unused objects periodically; no automated cleanup is included.
- Images are content, not code. The site never renders SVG uploads, which avoids script-in-SVG risk.

## Browser hardening

- `vercel.json` sets CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS on Vercel. `public/_headers` provides equivalent host rules for Cloudflare Pages/Netlify.
- Tighten `connect-src` and `img-src` from `https://*.supabase.co` to the exact project origin after provisioning.
- The public site uses a same-origin React bundle and Google Fonts. The CSP does not allow inline scripts or third-party script CDNs. `style-src 'unsafe-inline'` remains for the static no-JavaScript notice in `index.html`.
- The site is not embedded in an iframe; framing is denied with `frame-ancestors 'none'` and `X-Frame-Options: DENY`.

## Residual risks and what is not included

- The rate limit is per IP hash inside a fifteen-minute window. It is a basic abuse control, not bot management, a WAF or a CAPTCHA.
- No automated data-retention job is included. Define a retention period, then delete old inquiries from the dashboard or with a scheduled SQL task.
- No monitoring, alerting or audit-log export is configured.
- The site does not process payments or store passwords itself; authentication is delegated to Supabase.
- Uploaded portfolio images are public and could be indexed. Do not upload confidential material.

## Before using real visitor data

1. Apply all migrations and review the policies in the target project (`select * from pg_policies where schemaname = 'public';`). Confirm row-level security is on for every table:

   ```sql
   select relname, relrowsecurity
   from pg_class
   where relnamespace = 'public'::regnamespace
     and relname in ('projects', 'inquiries', 'admin_users', 'inquiry_rate_limits');
   ```
2. Set `SITE_ORIGIN` to the exact production origin and verify a foreign-origin request is rejected.
3. Confirm signed-out requests cannot read `inquiries`, `admin_users` or rate-limit rows.
4. Create the allowlisted admin account with a unique password and enable MFA in Supabase if available for your plan.
5. Configure Resend only with a verified sending domain, and test reply-to handling.
6. Publish a privacy note describing what an inquiry stores, why, and how to request deletion.
7. Review Supabase and hosting logs periodically, and rotate function secrets if they are exposed.

## Reporting

Report a suspected vulnerability privately to the repository owner at pramanixlabs@gmail.com. Do not include secrets or personal data in a public issue.
