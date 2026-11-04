import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { pad2 } from '@core/utils/links';
import { Breadcrumbs, CtaBand, PageHero } from '@shared/components/parts';

@Component({
  selector: 'app-how-it-works',
  imports: [Breadcrumbs, CtaBand, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let h = d.howItWorks;
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [eyebrow]="d.nav.howItWorks" [title]="h.h1" [lead]="h.intro" />
    <section class="section">
      <div class="container">
        <ol class="stages">
          @for (s of h.steps; track s.title; let i = $index) {
            <li class="stages__item"><span class="stages__n" aria-hidden="true">{{ pad(i + 1) }}</span><h2 class="stages__title">{{ s.title }}</h2><p class="stages__text">{{ s.text }}</p></li>
          }
        </ol>
        <p class="note">{{ h.note }}</p>
      </div>
    </section>
    <app-cta-band [title]="h.ctaTitle" [text]="h.ctaText" [consultationFirst]="true" />`,
})
export class HowItWorks {
  protected readonly ctx = inject(PageContext);
  protected readonly pad = pad2;
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.howItWorks, path: '/how-it-works' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/how-it-works', this.ctx.d().howItWorks.meta)); }
}
