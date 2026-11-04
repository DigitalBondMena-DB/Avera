import type { Routes } from '@angular/router';
import { langMatch } from '@core/guards/lang.guard';
import { publishedMatch, slugMatch } from '@core/guards/publication.guard';
import { MARKET_SLUGS, SERVICE_SLUGS } from '@core/constants/routes';

export const routes: Routes = [
  // No IP or Accept-Language redirects: the root always goes to the default language.
  { path: '', pathMatch: 'full', redirectTo: 'en' },
  {
    path: ':lang',
    canMatch: [langMatch],
    loadComponent: () => import('@layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('@features/home/home').then(m => m.Home) },
      { path: 'about', loadComponent: () => import('@features/about/about').then(m => m.About) },
      { path: 'about/leadership', canMatch: [publishedMatch('/about/leadership')], loadComponent: () => import('@features/about/leadership/leadership').then(m => m.Leadership) },
      { path: 'about/clients', canMatch: [publishedMatch('/about/clients')], loadComponent: () => import('@features/about/clients/clients').then(m => m.Clients) },
      { path: 'careers', loadComponent: () => import('@features/careers/careers').then(m => m.Careers) },
      { path: 'services', loadComponent: () => import('@features/services/services-hub').then(m => m.ServicesHub) },
      { path: 'services/:slug', canMatch: [slugMatch(SERVICE_SLUGS)], loadComponent: () => import('@features/services/service-detail/service-detail').then(m => m.ServiceDetail) },
      { path: 'markets', loadComponent: () => import('@features/markets/markets-hub').then(m => m.MarketsHub) },
      { path: 'markets/why-egypt', loadComponent: () => import('@features/markets/why-egypt/why-egypt').then(m => m.WhyEgypt) },
      { path: 'markets/:slug', canMatch: [slugMatch(MARKET_SLUGS)], loadComponent: () => import('@features/markets/market-detail/market-detail').then(m => m.MarketDetail) },
      { path: 'how-it-works', loadComponent: () => import('@features/how-it-works/how-it-works').then(m => m.HowItWorks) },
      { path: 'industries', loadComponent: () => import('@features/industries/industries').then(m => m.Industries) },
      { path: 'pricing', loadComponent: () => import('@features/pricing/pricing').then(m => m.Pricing) },
      { path: 'insights', canMatch: [publishedMatch('/insights')], loadComponent: () => import('@features/insights/insights').then(m => m.Insights) },
      { path: 'faq', loadComponent: () => import('@features/faq/faq').then(m => m.FaqPage) },
      { path: 'contact', loadComponent: () => import('@features/contact/contact').then(m => m.Contact) },
      { path: 'thank-you', loadComponent: () => import('@features/thank-you/thank-you').then(m => m.ThankYou) },
      { path: 'trust', loadComponent: () => import('@features/trust/trust').then(m => m.Trust) },
      { path: 'guides/hiring-in-egypt', canMatch: [publishedMatch('/guides/hiring-in-egypt')], loadComponent: () => import('@features/guide/guide').then(m => m.Guide) },
      { path: 'privacy', data: { doc: 'privacy' }, loadComponent: () => import('@features/legal/legal-page').then(m => m.LegalPage) },
      { path: 'terms', data: { doc: 'terms' }, loadComponent: () => import('@features/legal/legal-page').then(m => m.LegalPage) },
      { path: 'cookies', loadComponent: () => import('@features/legal/cookies/cookies').then(m => m.Cookies) },
      { path: 'sitemap', loadComponent: () => import('@features/sitemap/sitemap').then(m => m.HtmlSitemap) },
      { path: '**', loadComponent: () => import('@features/not-found/not-found').then(m => m.NotFound) },
    ],
  },
  { path: '**', loadComponent: () => import('@features/not-found/root-not-found').then(m => m.RootNotFound) },
];
