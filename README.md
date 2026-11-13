# PramanixLabs website

The official website of PramanixLabs, an independent technology studio founded by Manthan Lonkar in Pune, India. The site introduces the studio, six service areas, the project portfolio, projects still in exploration, editorial themes and an inquiry channel.

The public site is a React + TypeScript + Vite application with a Three.js particle-vortex hero. A private studio dashboard at `/admin` edits project records and reads inquiries through Supabase.

## Stack

- React 19, TypeScript, Vite 6
- Three.js via React Three Fiber for the hero (lazy-loaded, with a CSS fallback)
- Supabase: Auth, Postgres with row-level security, Storage and one Edge Function
- Vitest and Testing Library for content and form checks

## Project structure

```text
index.html                     document metadata, JSON-LD, fonts
public/                        favicon, social image, robots.txt, _headers, _redirects
src/App.tsx                    tiny router: public site or /admin
src/pages/HomePage.tsx         public page composition
src/pages/AdminPage.tsx        private dashboard (login, portfolio editor, inbox)
src/components/                Header, Vortex hero, InquiryForm, Brand
src/data/content.ts            services, projects, insights, inquiry topics
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

The public site works without Supabase; only inquiry delivery, admin access, editable project rows and image uploads need it. The hero still animates without any backend.

Useful scripts:

```sh
npm run build     # type-check and production build to dist/
npm test          # content and form tests
npm run lint      # ESLint
npm run preview   # serve the built site locally
```

## Content

- **Services, projects, insights, form topics and studio links** live in `src/data/content.ts`. Project `tags` and public repository links come from this file only; database rows cannot add links.
- **Project copy, status, ordering, upcoming flag and portfolio images** are managed at `/admin` and stored in Supabase. The public site falls back to `src/data/content.ts` when no rows are available.
- **Upcoming innovations** are project rows with `upcoming = true`. Toggle the flag in the dashboard to move an entry into the “On the horizon” section; the counter updates automatically.
- **Insights** are labelled “Editorial theme” in the UI. They are not articles, and intentionally have no fake publish dates or links.

Restovra and KavachScan are private projects: their records carry no repository link and are described as “Source kept private”. Do not add public links to them.

## Supabase setup

Full steps, secrets and troubleshooting are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short:

1. Create a Supabase project.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and in your host's build environment.
3. Apply both migrations in `supabase/migrations/` with `supabase db push`.
4. Disable public sign-ups. Create the studio user in Supabase Auth, then insert its UUID into `public.admin_users`.
5. Deploy `submit-inquiry` with `--no-verify-jwt` (it is a public form endpoint) and set `SITE_ORIGIN`.
6. Optionally add `RESEND_API_KEY`, `INQUIRY_RECIPIENT` and `INQUIRY_FROM` as function secrets for email notifications. Inquiries are stored with or without email.

Access model: the browser holds only the project URL and anon key. Row-level security limits reads of inquiries, writes to projects and storage uploads to users in `public.admin_users`. The service-role key exists only inside the Edge Function runtime. There is no public sign-up and no public admin link other than the small “Studio access” link in the footer.

## Deployment

The build is static. `public/_headers` and `public/_redirects` cover Cloudflare Pages and Netlify (headers and SPA fallback). Other hosts need the included `_headers` values applied in their configuration, plus a rewrite of unknown paths to `/index.html`.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting options, CSP, canonical/OG URLs and the launch checklist, and [docs/SECURITY.md](docs/SECURITY.md) for the access model and data boundaries.

## Accuracy policy

- Company and founder framing follows the public LinkedIn profiles.
- Project descriptions follow the public project sources. Private repositories are never linked or described as publicly available.
- Cybersecurity and digital learning appear as areas of active interest through existing projects, not as claims of an independently verified company service. The six listed service areas are AI & AI agents, SaaS products & dashboards, web development, mobile applications, custom software, and automation & digital solutions.
- No customers, testimonials, awards, launch dates, guarantees or measured outcomes are claimed anywhere on the site.
- Projects in exploration are explicitly labelled as such.

## Status of external services

This repository contains the complete application and schema, but no live Supabase project, email provider, domain or hosting account. Supabase, email delivery, storage, authentication and deployment have not been verified by the repository author; follow the deployment guide to configure and verify them against your own project.
