# Deployment guide

The repository builds a static Vite application and a Supabase backend. Deployment is not active until the project owner provisions the services below.

## 1. Prepare Supabase

1. Create a production Supabase project in the intended region.
2. Apply the migration with `supabase link --project-ref <project-ref>` and `supabase db push`.
3. Disable public Auth sign-up. Create the studio administrator through Supabase Auth, then add that user's UUID to `public.admin_users` from the SQL editor.
4. Deploy `supabase functions deploy submit-inquiry`.
5. Set function secrets: `SITE_ORIGIN` (exact production origin; comma-separated only if multiple), and optionally `RESEND_API_KEY`, `INQUIRY_RECIPIENT`, `INQUIRY_FROM` for email notifications. The function stores valid inquiries even when email delivery secrets are not configured.
6. Keep the service-role key server-side. It is used by the Edge Function runtime and never belongs in `VITE_*` variables.

## 2. Build and host

```sh
npm ci
npm run build
```

Publish `dist/` with SPA fallback to `/index.html`. Set these browser-visible values in the host's build environment:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<project-anon-key>
```

The anon key is designed to be public; row-level security and Auth allowlists enforce access. Do not use a service-role or database password here.

Set the following headers on the hosting platform and tighten `connect-src` to the exact Supabase project origin. The inline style source is currently needed for project image styles; avoid adding inline scripts.

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://<project-ref>.supabase.co; connect-src 'self' https://<project-ref>.supabase.co wss://<project-ref>.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Configure HTTPS and HSTS at the host after the custom domain is active and verified. Update `SITE_ORIGIN` to exactly match the public URL, including scheme and port only when applicable.

## 3. Verify before launch

- Confirm `/admin` directly loads through the SPA fallback, then verify an allowlisted account can sign in and an ordinary account cannot access private rows.
- Submit a test inquiry and confirm the database record appears. If email secrets are configured, verify notification delivery and reply-to handling.
- Upload an approved image from `/admin` and confirm it displays on the public portfolio. Portfolio images are intentionally public.
- Check mobile navigation, keyboard focus, reduced-motion behavior and the 3D hero on a physical mobile device.
- Confirm the chosen canonical domain and social preview before sharing the site.
