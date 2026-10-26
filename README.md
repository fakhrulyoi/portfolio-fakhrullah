# Mohamad Fakhrullah — Portfolio & CMS

A personal portfolio website with a private, no-code admin dashboard.

- **Public site** (`/`): hero, about, experience, projects, skills, education, resume and contact sections. Responsive, light/dark mode, SEO metadata, social sharing image, JSON-LD.
- **Admin dashboard** (`/admin`): edit every piece of content, upload images and your resume PDF, reorder and hide items, preview the draft, publish, restore older versions, read contact messages.
- **Stack**: Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Radix UI primitives · Supabase (Postgres, Auth, Storage) · Vercel hosting.

## How it works

```
 Dashboard (/admin) ──save draft──▶ content tables (draft)
        │                                   │
        └──Publish──▶ publish_site() ──▶ publications (snapshot, version history)
                                                    │
 Public site (/) ◀── get_published_portfolio() ◀────┘   (cached; refreshed on publish)
```

- Edits are saved to **draft** tables. Visitors never see drafts.
- **Publish** copies the whole draft into an immutable snapshot. The public site reads only the latest snapshot and is refreshed instantly. Every snapshot is kept, so you can **restore** any earlier version from the Overview page.
- Security is enforced in the database (row-level security). Only users listed in `public.admins` can change content or upload files, even if someone bypasses the website.

---

## 1. Deploy (one time, about 20 minutes)

You need free accounts on **GitHub**, **Supabase** and **Vercel**.

### 1.1 Create the database (Supabase)
1. Go to <https://supabase.com/dashboard> → **New project**. Pick region **Southeast Asia (Singapore)**. Save the database password somewhere safe.
2. Open **SQL Editor** → **New query**, paste the full contents of [`supabase/setup.sql`](supabase/setup.sql) and press **Run**. You should see "Success".
3. **Authentication → Sign In / Providers → Email**: keep Email enabled, and turn **off** "Allow new users to sign up". (There is no public registration page; this closes the API too.)
4. **Authentication → Users → Add user → Create new user**: enter your email and a strong password (12+ characters), tick **Auto Confirm User**.
5. Back in **SQL Editor**, run (with your email):
   ```sql
   select public.grant_admin('yoifakrul@gmail.com');
   ```
   It should reply `Admin access granted to …`.
6. **Project Settings → API Keys**: note the **Project URL**, the **Publishable key** (or legacy `anon` key) and the **Secret key** (or legacy `service_role` key). Keep the secret key private.

### 1.2 Put the code on GitHub
Create a new **private** repository and upload this folder (or push it with Git). Do not upload `.env.local`.

### 1.3 Host it (Vercel)
1. <https://vercel.com/new> → import the GitHub repository (framework: Next.js, defaults are fine).
2. Before deploying, add **Environment Variables** (see [`.env.example`](.env.example)):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key |
   | `SUPABASE_SECRET_KEY` | Secret / service_role key (server-only) |
   | `NEXT_PUBLIC_SITE_URL` | Your site URL, e.g. `https://fakhrullah.vercel.app` |
   | `CONTACT_HASH_SALT` | Any long random text |

3. **Deploy**. When it finishes, open the URL. If you changed the project name, update `NEXT_PUBLIC_SITE_URL` to the final URL and **Redeploy**.

### 1.4 Connect auth to your URL
Supabase → **Authentication → URL Configuration**:
- **Site URL**: your site URL.
- **Redirect URLs**: add `https://YOUR-SITE/auth/confirm` (needed for "Forgot password" emails).

### 1.5 First sign-in
Open `https://YOUR-SITE/admin`, sign in, then work through the **Finish your profile** checklist (upload resume, photo, LinkedIn…) and press **Publish**.

---

### 1.6 Updates that need a database step
Most updates deploy automatically. A few add database changes; run each once in **Supabase → SQL Editor**:

| File | Needed for |
| --- | --- |
| `supabase/migrations/0002_private_resume_settings.sql` | Saving ATS resume settings (kept private, never published) |

New installs that ran the current `setup.sql` already include these.

## 2. Templates

Three layouts use the same content. Switch in **Site settings → Appearance → Template**, check with **Preview**, then **Publish**.

| Template | Best for |
| --- | --- |
| **Classic** | Open layout with a process diagram in the hero and project cards. |
| **Document** | Specification-style sheet with numbered sections and a contents list. Visitors can print it or save it as a clean PDF. |
| **Side panel** | Profile, contact links and resume button always visible in a dark panel on the left. |

## 3. Setting it up for a friend

Each person gets their own copy: their own GitHub repo, Supabase project and Vercel project. Nobody shares a database.

1. **Get the code**: on GitHub open this repo → **Use this template** (enable it under Settings → General → Template repository) or **Fork**. If the repo is private, add your friend as a collaborator first, or send them the ZIP.
2. **Database**: in their new Supabase project, run **`supabase/migrations/0001_init.sql`** only — *not* `setup.sql`, which loads Fakhrullah's content. Then follow 1.1 steps 3–6 with their own email.
3. **Hosting**: follow 1.3 and 1.4 with their own keys and URL.
4. **Content**: they sign in at `/admin`, fill in Profile, About, Experience and so on, pick a template, and press **Publish**. Until the first publish, the public page shows "Coming soon".

## 4. Updating the portfolio (no code)

| I want to… | Go to |
| --- | --- |
| Change name, title, headline, availability, photo, links | **Profile & home** |
| Edit the summary, strengths, target roles | **About** |
| Add / edit / reorder / hide jobs | **Experience** |
| Add projects, upload screenshots, add GitHub/live links | **Projects** |
| Edit skill categories | **Skills** |
| Edit education | **Education** |
| Replace the resume PDF | **Resume** → *Replace resume* |
| Change SEO title, sharing image, accent colour, dark mode, sections | **Site settings** |
| Make a tailored, ATS-friendly resume (PDF / Word / text) | **ATS resume** |
| Read contact form messages | **Messages** |
| Change password | **Account** |

Every save is a **draft**. Use **Preview** (top bar) to check, then **Publish**. Nothing changes on the live site until you publish. The top bar shows "Unpublished changes" until you do.

- **ATS resume**: builds a one-column resume from your portfolio content in the same layout as Fakhrullah's reference resume (centred header, Calibri-style font, ruled section headings, bold right-aligned dates). Technical skills are written as "Category: skill, skill" lines; references stay private. Change the target title and summary, pick which jobs/projects to include, paste a job ad to see which of its key terms you already use, then **Download PDF** or **Download Word**. **Use on my website** replaces the resume visitors download (publish to make it live).
- **How I work (Process section)**: Profile & home → "How you work". One line per step, written as `Step name: one short sentence`. Each step gets a matching animated illustration automatically (requirements, specs/documents, system/API design, wireframes, testing/UAT, sign-off/support), and the section pins while visitors scroll on large screens.
- **Hide vs delete**: the switch hides an item but keeps it in your draft; the bin deletes it (with confirmation).
- **Resume link**: `https://YOUR-SITE/resume` always opens the latest *published* PDF — use it in emails and job applications.
- **Profile photo**: Profile & home → *Upload image* (resized automatically) → Save draft → Publish. Turn "Show photo" off to hide it.
- **Images** are compressed in your browser before upload (max 15 MB in, 5 MB stored). Allowed: JPG, PNG, WebP, AVIF. Resume: PDF only, max 10 MB.

## 5. Backup and recovery

- **Version history**: Overview → *Published versions* → **Restore** puts any earlier version back (draft + live).
- **Full database backup**: Supabase → **Database → Backups** (daily backups on paid plans). On the free plan, export regularly:
  ```bash
  # Supabase > Project Settings > Database > Connection string (URI)
  pg_dump "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
    --schema=public --data-only -f portfolio-backup.sql
  ```
  Or simply: SQL Editor → `select content from publications order by id desc limit 1;` → copy the JSON somewhere safe.
- **Files** (images, resume): Supabase → **Storage** → buckets `images` and `documents` → download.
- **Restore into a new project**: run `supabase/setup.sql`, then load your data backup with `psql … -f portfolio-backup.sql`, re-upload storage files to the same paths, create your admin user and run `grant_admin` again.
- **Lost password**: `/admin/login` → *Forgot password?* (requires 1.4). Alternatively Supabase → Authentication → Users → your user → *Send password recovery*.

## 6. Custom domain (optional)

Buy a domain (e.g. `fakhrullah.my`), then Vercel → Project → **Settings → Domains** → add it and follow the DNS instructions. Afterwards update `NEXT_PUBLIC_SITE_URL` (Vercel, then Redeploy) and Supabase **Site URL** / **Redirect URLs**.

## 7. Optional extras

- **Email alerts for new messages**: create a free <https://resend.com> account and set `RESEND_API_KEY` and `CONTACT_NOTIFY_EMAIL` (and `CONTACT_FROM_EMAIL` once you verify a domain).
- **Stronger bot protection**: create a Cloudflare Turnstile widget and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

## 8. Security summary

- No public sign-up. Admin rights come only from `grant_admin()` run in the SQL Editor.
- Row-level security on every table; storage writes limited to admins; bucket-level MIME type and size limits.
- Public visitors can only call `get_published_portfolio()` (published, visible items; phone hidden unless you enable it).
- The secret key is used server-side only (contact form). Contact form: validation on client, server and database, honeypot field, timing check, same-origin check, per-sender and daily rate limits, optional Turnstile.
- Links are restricted to `http(s)`; React escapes all text; security headers (`X-Frame-Options`, `nosniff`, referrer policy, CSP `frame-ancestors`) are set in `next.config.ts`; `/admin` is `noindex`.

## 9. Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
npm run typecheck && npm run lint
```

`scripts/security-test.mjs` checks the database policies against a test project (needs an admin user and a non-admin user; see the file).

## Project structure

```
src/app/(site)/        public page, layout (theme)
src/app/admin/         login, dashboard pages, preview
src/app/api/contact/   contact form endpoint
src/app/resume/        stable link to the latest published resume
src/app/og/            generated social sharing image
src/components/site/   public UI
src/components/admin/  dashboard UI (forms, uploads, publish bar)
src/lib/               schemas (zod), server actions, Supabase clients
supabase/              SQL: migrations, seed, one-step setup.sql
```

## Content notes

Starting content comes only from the resume and transcripts. Fields the resume doesn't state (employment type, LinkedIn, GitHub, project links, myIASME tech stack) are left blank on purpose — fill them in from the dashboard.
