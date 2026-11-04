import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Breadcrumbs, CtaBand, FaqList, PageHero } from '@shared/components/parts';

@Component({
  selector: 'app-faq-page',
  imports: [Breadcrumbs, CtaBand, FaqList, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let f = d.faqPage;
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [eyebrow]="d.nav.faq" [title]="f.h1" [lead]="f.intro" />
    <section class="section">
      <div class="container">
        @for (g of groups(); track g.title) {
          <div class="split split--4-8 faq-group">
            <div class="split__intro"><h2 class="h3">{{ g.title }}</h2></div>
            <app-faq-list [items]="g.items" />
          </div>
        }
      </div>
    </section>
    <app-cta-band [title]="f.ctaTitle" [text]="f.ctaText" [consultationFirst]="true" />`,
})
export class FaqPage {
  protected readonly ctx = inject(PageContext);
  protected readonly groups = computed(() =>
    this.ctx.d().faqPage.groups.map(g => ({ ...g, items: this.ctx._Settings.confirmed(g.items) })).filter(g => g.items.length));
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.faq, path: '/faq' }]);
  constructor() {
    effect(() => {
      this.ctx._Seo.set(this.ctx.lang(), '/faq', this.ctx.d().faqPage.meta);
      this.ctx._Seo.jsonLd('faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: this.groups().flatMap(g => g.items).map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
      });
    });
  }
}
