# Security notes

## Data boundaries

- The browser contains only the Supabase project URL and anon key. Never place Supabase service-role credentials, Resend credentials or database passwords in the Vite application.
- Inquiry submissions pass through a Supabase Edge Function. It validates size and format, ignores a honeypot, applies a five-per-15-minute per-IP hashed limit, then writes using the server-side service role. The public browser has no direct inquiry-table insert permission.
- Inquiry messages and sender details are private. Only users listed in `public.admin_users` can read them. Disable public Auth sign-up and grant access intentionally.
- Portfolio image uploads use an allowlisted public bucket (JPEG, PNG, WebP or AVIF, maximum 5 MiB). Public reads are intentional because the images are displayed on the website; only admins may write.

## Before using real visitor data

- Apply the migration to a production Supabase project and review the resulting policies in that project.
- Set `SITE_ORIGIN` to the exact production site origin. Use the deployment guide to restrict CSP `connect-src` to the project's URL.
- Configure a Resend sending domain and secrets if inquiry notifications are needed. Test email receipt and abuse limits before publishing the form.
- Define data retention and delete old inquiries in line with the studio's policy. No automated retention job is included.
- Add an abuse response process and review Supabase/hosting logs. The rate limit is a basic IP-level control, not a full bot-management service.

## Reporting

Report a suspected vulnerability privately to the repository owner. Do not include secrets or personal information in a public issue.
