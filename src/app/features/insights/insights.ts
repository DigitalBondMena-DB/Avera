import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Breadcrumbs, DraftBanner, PageHero } from '@shared/components/parts';

const PATH = '/insights';

/** Draft: article titles are ideas only. Hidden from navigation until real articles exist. */
@Component({
  selector: 'app-insights',
  imports: [Breadcrumbs, DraftBanner, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let ins = d.insights;
    @if (draft()) { <app-draft-banner /> }
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [eyebrow]="d.nav.insights" [title]="ins.h1" [lead]="ins.intro" />
    <section class="section">
      <div class="container">
        <ul class="inline-links" aria-hidden="true">@for (f of ins.filters; track f) { <li><span>{{ f }}</span></li> }</ul>
        <p class="notice notice--warn">{{ ins.planned }}</p>
        <ol class="ruled ruled--1">@for (t of ins.plannedTitles; track t) { <li><div><h2 class="ruled__title">{{ t }}</h2></div></li> }</ol>
      </div>
    </section>`,
})
export class Insights {
  protected readonly ctx = inject(PageContext);
  protected readonly draft = computed(() => this.ctx._Settings.status(PATH) === 'draft');
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.insights, path: PATH }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), PATH, this.ctx.d().insights.meta, { noindex: this.draft() })); }
}
