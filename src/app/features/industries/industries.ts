import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { pad2 } from '@core/utils/links';
import { Breadcrumbs, CtaBand, PageHero } from '@shared/components/parts';
import { ProposalButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-industries',
  imports: [RouterLink, Breadcrumbs, CtaBand, PageHero, ProposalButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let ind = d.industries;
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [eyebrow]="d.nav.industries" [title]="ind.h1" [lead]="ind.intro" />
    <section class="section">
      <div class="container split split--4-8">
        <nav class="split__intro anchor-nav" [attr.aria-label]="d.common.onThisPage">
          <p class="eyebrow">{{ d.common.onThisPage }}</p>
          <ul>@for (s of ind.sectors; track s.id) { <li><a [routerLink]="[]" [fragment]="s.id">{{ s.name }}</a></li> }</ul>
        </nav>
        <div class="sectors">
          @for (s of ind.sectors; track s.id; let i = $index) {
            <section [id]="s.id" class="sector" [attr.aria-labelledby]="s.id + '-t'">
              <span class="sector__n">{{ pad(i + 1) }}</span>
              <div class="sector__body">
                <h2 class="h3" [id]="s.id + '-t'">{{ s.name }}</h2>
                <p><span class="sector__label">{{ ind.rolesLabel }}: </span>{{ s.roles }}</p>
                <app-proposal-button [label]="ind.sectorCta" variant="link" />
              </div>
            </section>
          }
        </div>
      </div>
    </section>
    <app-cta-band [title]="ind.ctaTitle" [text]="ind.ctaText" />`,
})
export class Industries {
  protected readonly ctx = inject(PageContext);
  protected readonly pad = pad2;
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.industries, path: '/industries' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/industries', this.ctx.d().industries.meta)); }
}
