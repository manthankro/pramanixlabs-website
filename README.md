# PramanixLabs website

The official website of PramanixLabs, an independent technology studio founded by Manthan Lonkar in Pune, India. The site explains the studio’s services, project approach and inquiry process for businesses looking for software and digital product development.

The public site is a responsive React + TypeScript + Vite company website focused on services, project inquiries and a small overview of the studio’s own products. A private dashboard at `/admin` manages product details and reads inquiries through Supabase.

## Stack

- React 19, TypeScript, Vite 6
- Responsive service and project inquiry experience with React
- Supabase: Auth, Postgres with row-level security, Storage and one Edge Function
- Vitest and Testing Library for content and form checks

## Project structure

```text
index.html                     document metadata, JSON-LD, fonts
public/                        favicon, social image, robots.txt, _headers, _redirects
src/App.tsx                    tiny router: public site or /admin
src/pages/HomePage.tsx         company services and project inquiry page
src/pages/AdminPage.tsx        private dashboard (login, product details, inquiry inbox)
src/components/                Header, InquiryForm and Brand
src/data/content.ts            services, studio products and inquiry topics
src/styles.css                 design system and responsive layout
src/lib/supabase.ts            browser client; null when unconfigured
src/lib/useSeo.ts              per-route title and social metadata
supabase/migrations/           schema, RLS, allowlist, storage, seed copy
supabase/functions/            submit-inquiry Edge Function
docs/                          deployment and security guides
```

## Local development

```sh
npm ci
cp .env.example .env.local     # optional: leave empty to run without Supabase
npm run dev
```

The public site works without Supabase. Without the public Supabase settings, the inquiry form falls back to the visitor’s email app; with the settings and deployed function, inquiries are stored in Supabase. Admin access, editable project rows and image uploads also need Supabase.

Useful scripts:

```sh
npm run build     # type-check and production build to dist/
npm test          # content and form tests
npm run lint      # ESLint
npm run preview   # serve the built site locally
```

## Content

- **Services, project records, inquiry topics and studio links** live in `src/data/content.ts`. Service descriptions and inquiry topics are used on the company website.
- **In-house product names, status and descriptions** can be managed at `/admin` and stored in Supabase. The public section falls back to `src/data/content.ts` when Supabase is not configured.
- **Concept-stage products** are project rows with `upcoming = true`; the public page lists products currently in development or evaluation.
- The homepage is designed to explain services and collect project requests. It does not claim client testimonials, case study outcomes or fixed delivery timelines.

Restovra and KavachScan are private projects: their records carry no repository link and are described as “Source kept private”. Do not add public links to them.

## Supabase setup

Full steps, secrets and troubleshooting are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short:

1. Create a Supabase project.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and in your host's build environment.
3. Apply the migrations in `supabase/migrations/` with `supabase db push`.
4. Disable public sign-ups. Create the studio user in Supabase Auth, then insert its UUID into `public.admin_users`.
5. Deploy `submit-inquiry` with `--no-verify-jwt` (it is a public form endpoint) and set `SITE_ORIGIN`.
6. Optionally add `RESEND_API_KEY`, `INQUIRY_RECIPIENT` and `INQUIRY_FROM` as function secrets for email notifications. Inquiries are stored with or without email.

Access model: the browser holds only the project URL and anon key. Row-level security limits reads of inquiries, writes to projects and storage uploads to users in `public.admin_users`. The service-role key exists only inside the Edge Function runtime. There is no public sign-up and no public admin link other than the small “Studio access” link in the footer.

## Deployment

The build is static. `vercel.json` configures Vercel security headers and the `/admin` SPA fallback. `public/_headers` and `public/_redirects` cover Cloudflare Pages and Netlify. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for Preview and Production; these are public browser configuration values. Configure `SITE_ORIGIN` and optional email secrets in Supabase Edge Function settings.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting options, CSP, canonical/OG URLs and the launch checklist, and [docs/SECURITY.md](docs/SECURITY.md) for the access model and data boundaries.

## Accuracy policy

- Company and founder framing follows the public LinkedIn profiles.
- Project descriptions follow the public project sources. Private repositories are never linked or described as publicly available.
- Cybersecurity and digital learning appear as areas of active interest through existing projects, not as claims of an independently verified company service. The six listed service areas are AI & AI agents, SaaS products & dashboards, web development, mobile applications, custom software, and automation & digital solutions.
- No customers, testimonials, awards, launch dates, guarantees or measured outcomes are claimed anywhere on the site.
- Projects in exploration are explicitly labelled as such.

## Status of external services

The repository contains the application and schema. The website is deployed through Vercel, while live Supabase setup, inquiry delivery, admin access and email notifications depend on the project owner’s Supabase configuration. Follow the deployment guide and verify each feature against the connected services.
