# Banchory Lodge — Duty Manager Report

A rebuild of the single-file `dm-report-v17.html` as a small multi-file static site.
Vanilla HTML/CSS/JS with ES modules. There's no framework and no build step.

- **Hosting:** Cloudflare Pages (static)
- **Storage:** `localStorage` first, so the app works fully offline. **Supabase** is optional and adds sync across devices.
- **Libraries:** loaded from a CDN only when needed (Supabase JS, SheetJS, pdf.js), with versions pinned in `js/config.js`.

## Layout

```
index.html              App shell: sticky header, tabs, one <section> per tab
_headers                Cloudflare Pages response headers
sw.js                   Service worker (offline app shell + CDN cache)
manifest.webmanifest    PWA manifest
css/
  tokens.css            Colours, fonts, radii (design system)
  base.css              Reset, typography, header + tabs
  components.css        Cards, KPI tiles, forms, stepper, tables, buttons
  print.css             A4 portrait: dashboard → page break → weekly stats
js/
  main.js               Bootstrap: wires tabs, store, Supabase, SW
  config.js             Constants (TOTAL_ROOMS, defaults, CDN URLs)
  core/                 store (state + localStorage), router, dom helpers, dates, format, lazy loader
  calc/kpis.js          Pure KPI maths (occupancy, ADR, RevPAR, vs budget)
  data/client.js        Supabase connect / disconnect / auto-connect
  data/repo.js          Per-table load/save (no-ops when offline)
  ui/                   Reusable widgets (KPI tile, stepper)
  tabs/                 dashboard, today, lookahead, weekly, admin. Each exports render(el)
  importers/            Import Reports: occupancy xls/pdf, restaurant csv, weekly xlsx
  export/excel.js       Today → .xlsx
sql/schema.sql          Reference schema (shown on the Admin tab)
assets/icons/           App icon
test-fixtures/          Local-only sample reports (git-ignored)
```

### How data flows

1. Every tab reads from `core/store.js` and writes to it with `update(fn)`.
2. Each `update` saves to `localStorage` and notifies subscribers, so the Dashboard re-renders straight away. That includes changes from imports, with no save needed.
3. **Save** buttons also push to Supabase through `data/repo.js` when connected.

Importers return a normalised `ImportResult` (`{ rooms, covers }` keyed by date). `importers/index.js` merges it: today's date goes to the daily report, and future dates go to the look-ahead.

## Run locally

ES modules need HTTP, not `file://`:

```sh
cd bl-dm-report
python3 -m http.server 8080      # or: npx serve .
```

Open http://localhost:8080.

## Deploy to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the GitHub repo (the same way as `bl-staff-training`).
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` if this folder is the repo root, otherwise the folder path. While it lives inside `flat-checklist`, set **Root directory** to `bl-dm-report` and output to `/`.
   - **Production branch:** `main`
4. Save and deploy. Every push to `main` deploys to production, and other branches get preview URLs.

## Supabase

The tables already exist in the live project. On a new device, open **Admin**, paste the project URL and the **anon** key, then press **Connect**. The config stays in that browser's `localStorage`.

`sql/schema.sql` is a reference copy for first-time setup. Check its column names against the live database before using it on a fresh project. RLS policies grant the anon role read/write, so anyone with the URL and anon key can change the data. Keep the deployed URL internal, or put it behind Cloudflare Access.

## Status

Scaffold only. Tab navigation, store, KPI maths, Supabase connect, the stepper, and the import pipeline wiring all work. Feature modules have `TODO(feature)` markers where logic will be ported from v17.
