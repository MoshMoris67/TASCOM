# Talents College Mukono

The official website for **Talents College Mukono** — a private co-educational day & boarding
secondary school in Mukono, Uganda, nurturing academic excellence and practical talent since 2002.

Built with **TanStack Start** (React + TypeScript), styled with **Tailwind CSS v4**, and backed by
**Supabase** for authentication and data (contact messages, admission inquiries, applications, news,
events, media).

---

## Tech stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Framework    | [TanStack Start](https://tanstack.com/start) (SSR)      |
| Routing      | TanStack Router (file-based, `src/routes/`)             |
| UI           | React 19 + Radix UI primitives                          |
| Styling      | Tailwind CSS v4 + `tw-animate-css`                      |
| Backend/DB   | Supabase (Postgres, Auth, Storage)                      |
| Build/Server | Vite + Nitro                                            |
| Deploy       | Netlify (via `@netlify/vite-plugin-tanstack-start`)    |

---

## Getting started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or pnpm/yarn)
- A **Supabase** project (the site reads from it at runtime)

### Install

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable                        | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL                         |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key              |
| `VITE_SUPABASE_PROJECT_ID`      | Supabase project reference ID               |
| `SUPABASE_URL`                  | Same as `VITE_SUPABASE_URL` (server-side)   |
| `SUPABASE_PUBLISHABLE_KEY`      | Same as `VITE_SUPABASE_PUBLISHABLE_KEY`      |
| `SUPABASE_PROJECT_ID`           | Same as `VITE_SUPABASE_PROJECT_ID`           |

> The publishable/anon key is safe to expose client-side. Never put a Supabase
> **service-role** key in a `VITE_*` variable.

### Run locally

```bash
npm run dev
```

Open http://localhost:5173.

To preview the production build locally:

```bash
npm run build
npm run start      # serves dist/server/server.js (Node)
# or
npm run preview     # Vite preview server
```

---

## Scripts

| Script           | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start the dev server                         |
| `npm run build`  | Production build (emits Netlify function)    |
| `npm run start`  | Run the built Node server                    |
| `npm run preview`| Preview the built client                     |
| `npm run lint`   | Lint with ESLint                             |
| `npm run format` | Format with Prettier                         |

---

## Project structure

```
src/
  assets/            Images, photos, badge, crest
  components/        Reusable UI (layout, forms, gallery, ...)
  integrations/
    supabase/        Supabase client + generated types
  lib/               school-info, photos, utils
  routes/            File-based routes (pages)
    _authenticated/  Admin dashboard (protected)
    about.tsx        About page
    admissions.tsx   Admissions
    contact.tsx      Contact
    news.tsx         News
    ...              Other public pages
  styles.css         Design system (Tailwind theme, tokens)
  server.ts          SSR entry / error wrapper
```

### Key pages

- **Public**: Home, About, Academics, Admissions, Student Life, Alumni, News, Events,
  Gallery, Media, Contact, Apply.
- **Admin** (`/auth` → `/admin`): dashboard, messages, inquiries, applications, news,
  events, media. Requires Supabase authentication.

---

## Deployment (Netlify)

This repo is configured for **Netlify** via `netlify.toml` and the
`@netlify/vite-plugin-tanstack-start` Vite plugin.

1. Push the repository to GitHub/GitLab.
2. In Netlify: **Add new project → Deploy from Git**, connect the repo.
   - Build command: `npm run build` (set in `netlify.toml`)
   - Publish directory: `dist`
3. Add the environment variables listed above in **Site settings → Environment variables**.
4. Deploy. Netlify emits the serverless function and serves the static client automatically.

> Other hosts: the build also produces a Nitro Node server (`dist/server/server.js`) that
> can run on any Node host (Render, Railway, Fly.io, VPS) with `npm run start`.

---

## Design system

Brand tokens are defined as CSS variables in `src/styles.css` and aliased to legacy `flag-*`
names (e.g. `bg-flag-black`, `text-flag-red`, `bg-flag-yellow`). Colours use `oklch`; do not
hardcode colours in components — use the tokens.

- **Palette**: deep navy (`flag-black`), cream (`flag-yellow`), blue (`flag-red`), sky (`flag-blue`).
- **Fonts**: Playfair Display (display/headings) + Inter (body), loaded from Google Fonts.
- **Dark mode**: toggle in the header; theme handled via a `.dark` class.

---

## Notes

- This project is connected to Lovable. Avoid rewriting published git history (force push /
  rebase amendments) — it syncs back to Lovable and the history may be lost.
- `.env` is gitignored. Never commit secrets.
- `dist/`, `.netlify/`, and `node_modules/` are gitignored.

---

© Talents College Mukono. All rights reserved. Reg. No. ME/22/3549 · Ministry of Education & Sports, Uganda.
