import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';
import { ROUTES_LIST } from './app/core/constants/routes';

/*
 * Runtime environment (set on the host / pm2 / Coolify):
 *   SITE_ENV=production|staging     staging adds X-Robots-Tag: noindex and a disallow-all robots.txt
 *   NG_ALLOWED_HOSTS=averaelite.com,www.averaelite.com   (SSR host allow-list, read by Angular)
 *   NG_TRUST_PROXY_HEADERS=x-forwarded-for,x-forwarded-proto  when behind Nginx
 *   PORT=4000
 */
const browserDistFolder = join(import.meta.dirname, '../browser');
const SITE_ENV = process.env['SITE_ENV'] === 'production' ? 'production' : 'staging';
const defaultAllowedHosts = 'localhost,*.vercel.app,averaelite.com,www.averaelite.com';
const allowedHosts = (process.env['NG_ALLOWED_HOSTS'] ?? defaultAllowedHosts)
  .split(',')
  .map(h => h.trim())
  .filter(Boolean);
const trustProxyHeaders = (process.env['NG_TRUST_PROXY_HEADERS'] ?? 'x-forwarded-for,x-forwarded-proto,x-forwarded-host')
  .split(',')
  .map(h => h.trim())
  .filter(Boolean);

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');
const angularApp = new AngularNodeAppEngine({ allowedHosts, trustProxyHeaders });

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (SITE_ENV !== 'production') res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(SITE_ENV === 'production'
    ? `User-agent: *\nAllow: /\nDisallow: /en/thank-you\nDisallow: /ar/thank-you\n\nSitemap: ${environment.siteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');
});

/** sitemap.xml from the route list + publication state served by the API (drafts and utility pages excluded). */
app.get('/sitemap.xml', async (_req, res) => {
  let statuses: Record<string, string> = { '/about/leadership': 'draft', '/about/clients': 'draft', '/insights': 'draft', '/guides/hiring-in-egypt': 'draft', '/thank-you': 'utility' };
  try {
    const r = await fetch(`${environment.apiBaseUrl}/settings`, { signal: AbortSignal.timeout(4000) });
    if (r.ok) statuses = ((await r.json()) as { data: { publication: { routes: Record<string, string> } } }).data.publication.routes;
  } catch { /* keep safe defaults */ }
  const url = (lang: string, p: string) => `${environment.siteUrl}/${lang}${p === '/' ? '' : p}`;
  const today = new Date().toISOString().slice(0, 10);
  const entries = ROUTES_LIST.filter(p => (statuses[p] ?? 'public') === 'public').flatMap(p => ['en', 'ar'].map(lang => `
  <url>
    <loc>${url(lang, p)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${url('en', p)}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${url('ar', p)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en', p)}"/>
    <lastmod>${today}</lastmod>
  </url>`)).join('');
  res.type('application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}\n</urlset>\n`);
});

// Hashed build assets: cache for a year. Translations and images: shorter, they are not content-hashed.
app.use('/i18n', express.static(join(browserDistFolder, 'i18n'), { maxAge: '10m' }));
app.use('/images', express.static(join(browserDistFolder, 'images'), { maxAge: '30d' }));
app.use(express.static(browserDistFolder, { maxAge: '1y', immutable: true, index: false, redirect: false }));

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(response => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

  if (!process.env['VERCEL'] && (isMainModule(import.meta.url) || process.env['pm_id'])) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, error => {
      if (error) throw error;
      console.log(`AVERA SSR listening on http://localhost:${port} (${SITE_ENV})`);
    });
  }

  export const reqHandler = createNodeRequestHandler(app);
  export default app;
