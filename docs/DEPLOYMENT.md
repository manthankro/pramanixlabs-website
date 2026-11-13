# Deployment guide

This repository builds to static files in `dist/` and uses Supabase for auth, data, storage and one Edge Function. Nothing is deployed or provisioned by the repository itself. The steps below are the complete path from a fresh clone to a verified production site.

## 1. Supabase

### 1.1 Create and link the project

1. Create a project at [supabase.com](https://supabase.com) in the region closest to your visitors.
2. Install the Supabase CLI and link this repository:

   ```sh
   supabase login
   supabase link --project-ref <project-ref>
   ```

3. Apply both migrations:

   ```sh
   supabase db push
   ```

   - `202611130001_init.sql` creates `admin_users`, `inquiries`, `inquiry_rate_limits`, `projects`, the `is_site_admin()` and `claim_inquiry_slot()` functions, RLS policies and the `portfolio-media` bucket.
   - `202611130002_portfolio_refinements.sql` adds `image_alt`, `updated_at` maintenance, indexes, inquiry deletion for admins and the final project copy.

### 1.2 Create the only admin account

1. In Supabase → Authentication → Providers → Email, disable **Allow new users to sign up**. The dashboard has no public sign-up.
2. Authentication → Users → **Add user**: create the studio account with a strong password and confirm the email.
3. In the SQL editor, allowlist that user:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

4. Verify the allowlist:

   ```sql
   select u.email, a.user_id
   from public.admin_users a
   join auth.users u on u.id = a.user_id;
   ```

Only listed users can read inquiries, edit projects or upload portfolio images. A signed-in account that is not listed is denied by the dashboard and by RLS.

### 1.3 Deploy the inquiry function

The public form is called by anonymous visitors, so deploy without JWT verification. Abuse protection comes from the origin allowlist, honeypot, validation and the per-IP hashed rate limit.

```sh
supabase functions deploy submit-inquiry --no-verify-jwt
supabase secrets set SITE_ORIGIN="https://your-domain.example"
```

`SITE_ORIGIN` must be the exact origin, without a path or trailing slash. Use a comma-separated list only if the site is served from multiple origins (for example a preview and a production domain).

Optional email notifications through [Resend](https://resend.com):

```sh
supabase secrets set RESEND_API_KEY="re_..." INQUIRY_RECIPIENT="you@example.com" INQUIRY_FROM="PramanixLabs <website@your-domain.example>"
```

- `INQUIRY_FROM` must use a domain verified in Resend.
- Without these secrets every valid inquiry is still stored in `public.inquiries`; only the notification email is skipped.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function by Supabase. Never copy them into the Vite app.

### 1.4 Test the function locally (optional, recommended)

```sh
cp supabase/functions/.env.example supabase/functions/.env
# fill SITE_ORIGIN with http://localhost:5173
supabase functions serve submit-inquiry --no-verify-jwt --env-file supabase/functions/.env
```

Then submit the form from `npm run dev` and confirm the row in the SQL editor.

## 2. Build and host

```sh
npm ci
npm run build
```

Publish `dist/`. Set these browser-visible build variables in the hosting provider:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<project-anon-key>
```

The anon key is designed to be public; RLS and the admin allowlist enforce access. Never use a service-role key or database password in a `VITE_*` variable.

### SPA fallback

`/admin` is a client-side route. The host must serve `index.html` for unknown paths:

- Cloudflare Pages / Netlify: `public/_redirects` is already included and copied into `dist/`.
- Vercel: add a rewrite of `/(.*)` to `/index.html`.
- Any static server: configure the equivalent fallback.

### Headers

`public/_headers` ships the production header set for Cloudflare Pages and Netlify. For another host, apply the same values in its configuration:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://<project-ref>.supabase.co; connect-src 'self' https://<project-ref>.supabase.co wss://<project-ref>.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

The included `_headers` uses `https://*.supabase.co` so it works before the project ref is known. Tighten `connect-src` and `img-src` to the exact project origin before launch. `style-src 'unsafe-inline'` is required because the Three.js canvas sets inline style attributes; avoid adding inline scripts.

### Canonical URL and social preview

After the production domain is chosen:

1. Add `<link rel="canonical" href="https://your-domain.example/">` to `index.html`.
2. Change `og:image` and `twitter:image` to the absolute URL `https://your-domain.example/og-image.png`.
3. Replace `public/og-image.png` if the positioning changes; keep it at 1200 × 630.
4. Add a `Sitemap:` line to `public/robots.txt` if you publish a sitemap. This single-page site does not need one to be indexed.

## 3. Verify before launch

Work through this list against the real project, not the repository defaults.

- [ ] `npm run build`, `npm test` and `npm run lint` pass locally.
- [ ] The deployed site renders at desktop and mobile widths; the hero animates and degrades to the CSS fallback when WebGL is blocked or reduced motion is on.
- [ ] `/admin` loads directly (SPA fallback works), an allowlisted account signs in, and a non-allowlisted account is denied.
- [ ] A submitted inquiry appears in Supabase and in the dashboard inbox. If email secrets are set, the notification arrives with a working reply-to.
- [ ] Submitting faster than five times in fifteen minutes returns the rate-limit message.
- [ ] An image upload from `/admin` appears on the public portfolio with its alt text, and an unapproved MIME type or a file over 5 MB is rejected.
- [ ] Sign out clears access; reloading `/admin` requires a new session.
- [ ] Response headers include CSP and HSTS; the browser console has no CSP violations.
- [ ] Touch, keyboard-only navigation, Escape-to-close menu and visible focus states all work.
- [ ] The production `SITE_ORIGIN` matches the deployed origin exactly.

## 4. Continuing in Freebuff

1. Open the repository folder in Freebuff.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key. Freebuff does not need the service-role key; never paste it into chat or commit it.
3. Run `npm run dev` and verify the site, then `/admin` with the allowlisted account.
4. Ask Freebuff for code changes only; Supabase secrets should be set with the Supabase CLI or dashboard, not stored in project files.

## 5. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Form returns 403 | `SITE_ORIGIN` does not match the browser origin exactly (scheme, host, port). |
| Form returns 500 | Migrations were not applied, or the function lacks its Supabase environment variables. |
| Admin signs in but sees nothing | The user is not in `public.admin_users`, or migrations 001/002 were not applied. |
| Images upload but do not display | The bucket is not public, or CSP `img-src` does not include the project origin. |
| `/admin` returns 404 on refresh | SPA fallback is missing on the host. |
| Email notifications missing | `RESEND_API_KEY`, `INQUIRY_RECIPIENT` or `INQUIRY_FROM` missing, or the sender domain is unverified in Resend. Inquiries are still stored. |
