import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { Breadcrumbs, DraftBanner, PageHero } from '@shared/components/parts';
import { ProposalButton } from '@shared/components/cta-buttons';

const PATH = '/guides/hiring-in-egypt';

/** Draft until legal review: figures and interpretations are unverified source material. */
@Component({
  selector: 'app-guide',
  imports: [RouterLink, Breadcrumbs, DraftBanner, PageHero, ProposalButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let g = d.guide;
    @if (draft()) { <app-draft-banner /> }
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [title]="g.h1" />
    <section class="section">
      <div class="container guide">
        <nav class="guide__toc" [attr.aria-label]="d.common.onThisPage">
          <p class="eyebrow">{{ d.common.onThisPage }}</p>
          <ol>@for (c of g.chapters; track c.title; let i = $index) { <li><a [routerLink]="[]" [fragment]="'ch-' + (i + 1)">{{ c.title }}</a></li> }</ol>
        </nav>
        <div class="guide__body">
          <p class="notice notice--warn">{{ g.reviewNote }}</p>
          <div class="summary-box"><h2 class="h4">{{ g.summaryTitle }}</h2><p>{{ g.summary }}</p></div>
          @for (c of g.chapters; track c.title; let i = $index) {
            <section [id]="'ch-' + (i + 1)" class="guide__chapter">
              <h2 class="h3"><span class="guide__n">{{ i + 1 }}</span>{{ c.title }}</h2>
              <p>{{ c.text }}</p>
              <app-proposal-button [label]="g.chapterCta" variant="link" />
            </section>
          }
          <p class="note">{{ g.disclaimer }} {{ d.common.generalInfo }}</p>
        </div>
      </div>
    </section>`,
})
export class Guide {
  protected readonly ctx = inject(PageContext);
  protected readonly draft = computed(() => this.ctx._Settings.status(PATH) === 'draft');
  protected readonly trail = computed(() => [{ label: this.ctx.d().guide.h1, path: PATH }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), PATH, this.ctx.d().guide.meta, { noindex: this.draft() })); }
}
