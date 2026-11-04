import type { MarketSlug, ServiceSlug, ServiceGroup } from '@core/models/content.model';

export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const SERVICE_SLUGS: ServiceSlug[] = ['employer-of-record', 'payroll', 'social-insurance', 'health-life', 'talent-acquisition', 'legal-labor-relations', 'training', 'workspace', 'events'];
export const SERVICE_GROUPS: ServiceGroup[] = ['employ', 'talent', 'workplace'];
export const MARKET_SLUGS: MarketSlug[] = ['saudi-arabia', 'uae', 'qatar', 'kuwait', 'international'];
export const GULF_SLUGS: MarketSlug[] = ['saudi-arabia', 'uae', 'qatar', 'kuwait'];

/** The 35 logical routes (prefixed with /en or /ar). */
export const ROUTES_LIST = [
  '/', '/about', '/about/leadership', '/about/clients', '/careers',
  '/services', ...SERVICE_SLUGS.map(s => `/services/${s}`),
  '/markets', ...MARKET_SLUGS.map(s => `/markets/${s}`), '/markets/why-egypt',
  '/how-it-works', '/industries', '/pricing', '/insights', '/faq', '/contact', '/thank-you',
  '/privacy', '/terms', '/cookies', '/sitemap', '/trust', '/guides/hiring-in-egypt',
];

export type RouteStatus = 'public' | 'utility' | 'draft';
