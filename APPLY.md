# TASCOM fixes — how to apply

Unzip `tascom-fixes.zip` over your project root. The folder structure matches
your repo, so every file lands where it belongs. All ten files are complete
replacements — nothing needs merging by hand.

Verified before packaging: clean `npx tsc --noEmit`, successful `vite build`.

---

## Step 1 — Run the SQL. Do this first.

**Nothing about the upload works until you do.** The code was never the problem;
the bucket does not exist.

Open the Supabase SQL editor, paste `supabase/migrations/06_media_storage.sql`,
run it. The last statement prints two columns:

```
 bucket_ready | policies_ready
--------------+----------------
 t            | t
```

Both must read `t`. Then retry the upload in the admin.

If you keep the snippet library in the SQL editor (per your `00_README.md`),
replace the existing **MEDIA STORAGE** snippet with this version — the old one
used bare `CREATE POLICY` and errors out on any second run. This one is
idempotent and safe to re-run whenever you want to confirm the state.

## Step 2 — Add the two PDFs

`public/documents/` contains only a `README.txt`. The two download links on the
admissions page point at real filenames that aren't there yet, so they 404:

```
public/documents/talents-college-application-form.pdf
public/documents/talents-college-prospectus.pdf
```

Drop the files in with exactly those names. No code change needed.

---

## The files

### Routing — this is what broke "Read more"

| File | What changed |
|---|---|
| `src/routes/news.tsx` | Was a parent route that redirected in `beforeLoad`. `news.$slug.tsx` is its child, and a parent's `beforeLoad` runs first — so every article link bounced to `/media#news` before rendering. Now `<Outlet />` only. |
| `src/routes/apply.tsx` | Same defect. `/apply/success` is its child, so applicants were redirected away from the page showing their reference number. Now `<Outlet />` only. |
| `src/routes/admissions.tsx` | Was a 300-line duplicate of `admissions.index.tsx` (still carrying two dead `href="#"` download links) with a `component` and no `<Outlet />`, so `/admissions/check-status` rendered the wrong page. Now `<Outlet />` only. The page lives in `admissions.index.tsx` alone. |

The redirects for the bare `/news` and `/apply` URLs still exist — they're in
`news.index.tsx` and `apply.index.tsx`, which own those paths. Those two files
are unchanged and stay as they are.

### Gallery

| File | What changed |
|---|---|
| `src/components/gallery/Gallery.tsx` | **New.** Lightbox (arrow keys, Escape, prev/next, counter, focus restore, scroll lock), category filters, varied tile rhythm, captions on hover. Exports `Gallery` (full, filterable) and `GalleryPreview` (the strip on `/media`). |
| `src/routes/gallery.tsx` | Was a redirect to `/media#gallery`. Now the real full gallery page — which is where "Browse the full gallery" now goes, and what your `sitemap.xml` has been advertising to Google all along. |
| `src/routes/media.tsx` | Gallery section is now an 8-photo preview with a button to `/gallery`. Also fixes the highlight cards, which read `card.to` — a property never set on any card, so the "Open" affordance rendered on none of them. |
| `src/lib/media.ts` | Ordering was backwards: seed photos spread first meant every new upload landed below 33 photos of scrolling. Newest-first now, with duplicate seed photos dropped. |

### Buttons

| File | What changed |
|---|---|
| `src/routes/alumni.tsx` | "Join the alumni network" was a bare `<button>` with no `onClick` — hover state, cursor, did nothing. Now links to `/contact?subject=Alumni network`. |
| `src/routes/contact.tsx` | Accepts `?subject=` so arrivals from the alumni page find the subject pre-filled instead of a blank form. |

---

## Two things I left alone, deliberately

**The video library.** The third card on `/media` had no destination because there
is no video page. Rather than invent one, the card now says "Coming soon" instead
of styling itself like a link. If you want a real video page, that's a separate
piece of work — the `media` table already has `kind = 'video'` and a
`thumbnail_url` column, and the admin already writes to both, so the data side is
done.

**The newsletter signup.** Still points at `/contact`. There's no mailing list to
join yet; when there is, that's where it should go.
