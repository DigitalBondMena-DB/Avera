# AVERA website — Angular 21 SSR

Bilingual (English / Arabic, full RTL) marketing site for AVERA Elite Business Solutions. Built to the Digital Bond standards: standalone + zoneless + OnPush components, signals, `inject()`, `@if/@for/@defer`, Tailwind 4 with brand tokens in `@theme`, ngx-translate JSON, server-side rendering with `RenderMode.Server`.

Backend: the Laravel API in `../avera-api` (settings + lead submission).

## Run

```bash
npm ci
npm start                 # ng serve → http://localhost:4200, uses environment.development.ts (API http://localhost:8000/api/v1)

npm run build             # production build (environment.ts) — regenerates image derivatives first
npm run build:local       # production-optimized build pointed at a local API (environment.local.ts)
SITE_ENV=staging NG_ALLOWED_HOSTS=localhost PORT=4000 npm run serve:ssr
npm run typecheck
```

Node 22 LTS. The API must be running for live settings; if it is unreachable the site renders with safe defaults and every form reports "not sent".

## Runtime environment (SSR server)

| Variable | Purpose |
| --- | --- |
| `SITE_ENV` | `production` = indexable + real `robots.txt`. Anything else = `X-Robots-Tag: noindex` and disallow-all robots. |
| `NG_ALLOWED_HOSTS` | Comma-separated host allow-list for SSR (e.g. `averaelite.com,www.averaelite.com`). |
| `NG_TRUST_PROXY_HEADERS` | Set behind Nginx (e.g. `x-forwarded-for,x-forwarded-proto`). |
| `PORT` | Default 4000. |

Build-time: `src/environments/environment.ts` holds `siteUrl` and `apiBaseUrl` for production (`fileReplacements` swap in `environment.development.ts` / `environment.local.ts`). **Confirm the production domains before the first release.**

## Structure

```
src/app/
  core/        constants/ (api-end-points, routes, default-settings, image-manifest), services/, guards/, interceptors/, i18n/, models/, utils/
  shared/      components/ (icon, photo, parts, cta-buttons, lang-switch, forms/), directives/ (modal focus-trap)
  layouts/     main-layout/ (header, footer, mobile-bar, consent, lead-drawer)
  features/    one folder per page; services/:slug and markets/:slug are data-driven templates
public/i18n/   en.json, ar.json — all copy (typed via core/models/content.model.ts)
assets-src/    PNG masters → scripts/build-images.mjs → public/images/*.webp
```

- Routes: `/:lang/...` (`en`, `ar`), root → `/en`. Drafts use `canMatch` against the API's publication state, so hidden pages fall through to the localized 404 (real 404 status via `RESPONSE_INIT`).
- SEO: `SeoService` sets title, description, canonical, hreflang (en/ar/x-default), Open Graph and JSON-LD on the server. `sitemap.xml` and `robots.txt` come from `server.ts`.
- Translations: the server reads `i18n/*.json` from disk and hands them to the browser through `TransferState` (no second fetch).
- Images: `NgOptimizedImage` with a custom loader (WebP derivatives 480–1536 px); hero is `priority`, below-the-fold images are `@defer (on viewport)`.

## Tests

`tests/e2e.mjs` (Playwright) runs against the SSR server + API:

```bash
BASE=http://localhost:4000 API=http://localhost:8000/api/v1 EXPECT=preview node tests/e2e.mjs   # API without a delivery channel
BASE=http://localhost:4000 API=http://localhost:8000/api/v1 EXPECT=live node tests/e2e.mjs      # API with LEADS_WEBHOOK_URL / mail configured
```

Set `PW_ROOT=$(npm root -g)` if Playwright is installed globally. The Angular CLI unit-test scaffold (vitest/jsdom) was removed: jsdom's optional `canvas` peer breaks `npm install` in this toolchain.

## Deploy

One target: VPS with Node 22 + pm2 behind Nginx (or Coolify), built in CI from a tagged commit (`.github/workflows/ci.yml`). No committed `dist/`.
