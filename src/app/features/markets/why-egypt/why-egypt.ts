import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { pad2 } from '@core/utils/links';
import { Breadcrumbs, CtaBand, PageHero } from '@shared/components/parts';

@Component({
  selector: 'app-why-egypt',
  imports: [Breadcrumbs, CtaBand, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let w = d.whyEgypt;
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [eyebrow]="w.eyebrow" [title]="w.h1" [lead]="w.intro" />
    <section class="section">
      <div class="container">
        <ol class="quad">
          @for (b of w.blocks; track b.title; let i = $index) {
            <li><span class="quad__n">{{ pad(i + 1) }}</span><h2 class="quad__title">{{ b.title }}</h2><p class="quad__text">{{ b.text }}</p></li>
          }
        </ol>
        <p class="note">{{ w.note }}</p>
      </div>
    </section>
    <app-cta-band [title]="w.ctaTitle" [text]="w.ctaText" />`,
})
export class WhyEgypt {
  protected readonly ctx = inject(PageContext);
  protected readonly pad = pad2;
  protected readonly trail = computed(() => [
    { label: this.ctx.d().nav.markets, path: '/markets' },
    { label: this.ctx.d().nav.whyEgypt, path: '/markets/why-egypt' },
  ]);
  constructor() {
    effect(() => this.ctx._Seo.set(this.ctx.lang(), '/markets/why-egypt', this.ctx.d().whyEgypt.meta));
  }
}
