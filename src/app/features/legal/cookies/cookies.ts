import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { Breadcrumbs, PageHero, RuledList } from '@shared/components/parts';

/** Lists only the tools actually configured. */
@Component({
  selector: 'app-cookies',
  imports: [Breadcrumbs, PageHero, RuledList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = ctx.d().legal.cookies;
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [title]="c.h1" [lead]="c.intro" tone="white" />
    <section class="section section--tight">
      <div class="container prose">
        <h2 class="h4">{{ c.essentialTitle }}</h2>
        <app-ruled-list [items]="c.essential" [columns]="1" />
        <h2 class="h4">{{ c.optionalTitle }}</h2>
        @if (!tools().length) { <p>{{ c.optionalNone }}</p> } @else {
          <p>{{ c.optionalConfigured }}</p>
          <ul class="bullets">@for (t of tools(); track t) { <li dir="ltr">{{ t }}</li> }</ul>
          <button type="button" class="btn btn--secondary" (click)="analytics.bannerOpen.set(true)">{{ c.manage }}</button>
        }
      </div>
    </section>`,
})
export class Cookies {
  protected readonly ctx = inject(PageContext);
  protected readonly analytics = inject(AnalyticsService);
  protected readonly tools = computed(() => {
    const i = this.ctx._Settings.integrations();
    return [i.ga4Id ? 'Google Analytics 4 (Google LLC)' : null, i.linkedinPartnerId ? 'LinkedIn Insight Tag (LinkedIn Corporation)' : null].filter((x): x is string => !!x);
  });
  protected readonly trail = computed(() => [{ label: this.ctx.d().legal.cookies.h1, path: '/cookies' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/cookies', this.ctx.d().legal.cookies.meta)); }
}
