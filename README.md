# PramanixLabs website

Official company website for PramanixLabs, a technology venture founded by Manthan Lonkar in Pune, India. The site introduces the studio, its six listed service areas, project portfolio, upcoming innovations, editorial themes and inquiry channel.

## Stack

- React, TypeScript and Vite
- Three.js via React Three Fiber for the 15,000-point vortex hero
- Supabase Auth and Postgres for the private dashboard, editable portfolio and inquiry inbox
- Vitest for content checks

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

The public site works without Supabase. Inquiry delivery, admin access, editable project records and portfolio uploads require a configured Supabase project. Never put a service-role key in this Vite application.

## Supabase setup

1. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and your hosting provider.
2. Install the Supabase CLI, link the project and run `supabase db push` to apply `supabase/migrations/202611130001_init.sql`.
3. In Supabase Authentication, disable public signups. Create an admin user in the dashboard, then insert that user's UUID into `public.admin_users` using the SQL editor while signed in as the project owner.
4. Deploy the inquiry function: `supabase functions deploy submit-inquiry`. Set `SITE_ORIGIN` to the comma-separated production origin(s). To enable notifications, set `RESEND_API_KEY`, `INQUIRY_RECIPIENT` and `INQUIRY_FROM` as Supabase function secrets. Inquiry records are stored even when email notifications are not configured. The function applies a five-submissions-per-15-minute per-IP limit and a honeypot check.
5. Open `/admin` and sign in. The database row-level security policies allow only listed admin user IDs to read inquiries, edit projects or upload portfolio images. Portfolio images are public by design; only allowlisted admins can upload or replace them.

The Supabase Edge Function validates inquiry fields and stores messages in Postgres. Resend email delivery is optional and requires server-side secrets. Do not expose service credentials in client code.

## Build and checks

```sh
npm run build
npm test
npm run lint
```

## Deployment

See [the deployment guide](docs/DEPLOYMENT.md) for Supabase provisioning, static hosting, security headers and launch checks. No deployment, domain, email delivery or live Supabase project is included or claimed here. See [security notes](docs/SECURITY.md) for the access model and data boundaries.

## Content and accuracy

Company and founder framing follows the LinkedIn profiles. Restovra, KavachScan and Pramanix AI descriptions follow their repository READMEs. Links are shown for public repositories; private project sources are not exposed as visitor links. The remaining projects are named from the project brief, with descriptions kept intentionally limited. Editorial cards are clearly labeled as themes, not published articles. Update portfolio copy and article content as project scope becomes public.
