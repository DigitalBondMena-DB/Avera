import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { MARKET_SLUGS, SERVICE_SLUGS } from '@core/constants/routes';
import { Breadcrumbs, PageHero } from '@shared/components/parts';

@Component({
  selector: 'app-html-sitemap',
  imports: [RouterLink, Breadcrumbs, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [title]="ctx.d().sitemapPage.h1" tone="white" />
    <section class="section section--tight">
      <div class="container sitemap-grid">
        @for (g of groups(); track g.title) {
          <div><h2 class="h4">{{ g.title }}</h2><ul>@for (i of g.items; track i.p) { <li><a [routerLink]="ctx.L(i.p)">{{ i.l }}</a></li> }</ul></div>
        }
      </div>
    </section>`,
})
export class HtmlSitemap {
  protected readonly ctx = inject(PageContext);
  protected readonly trail = computed(() => [{ label: this.ctx.d().sitemapPage.h1, path: '/sitemap' }]);
  protected readonly groups = computed(() => {
    const d = this.ctx.d(), g = d.sitemapPage.groups, n = d.nav;
    const all = [
      { title: g.company, items: [{ p: '/', l: d.common.home }, { p: '/about', l: n.aboutAvera }, { p: '/about/leadership', l: n.leadership }, { p: '/about/clients', l: n.clients }, { p: '/trust', l: n.trust }, { p: '/careers', l: n.careers }, { p: '/contact', l: n.contact }] },
      { title: g.services, items: [{ p: '/services', l: d.common.allServices }, ...SERVICE_SLUGS.map(s => ({ p: `/services/${s}`, l: d.services[s].name }))] },
      { title: g.markets, items: [{ p: '/markets', l: n.markets }, ...MARKET_SLUGS.map(m => ({ p: `/markets/${m}`, l: d.markets[m].linkLabel })), { p: '/markets/why-egypt', l: n.whyEgypt }] },
      { title: g.resources, items: [{ p: '/how-it-works', l: n.howItWorks }, { p: '/industries', l: n.industries }, { p: '/pricing', l: n.pricing }, { p: '/faq', l: n.faq }, { p: '/insights', l: n.insights }, { p: '/guides/hiring-in-egypt', l: d.guide.h1 }] },
      { title: g.legal, items: [{ p: '/privacy', l: d.footer.privacy }, { p: '/terms', l: d.footer.terms }, { p: '/cookies', l: d.footer.cookies }] },
    ];
    return all.map(gr => ({ ...gr, items: gr.items.filter(i => this.ctx._Settings.isPublic(i.p)) }));
  });
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/sitemap', this.ctx.d().sitemapPage.meta)); }
}
