import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { pad2 } from '@core/utils/links';
import { Breadcrumbs, CtaBand, PageHero, RuledList } from '@shared/components/parts';
import { ProposalButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-pricing',
  imports: [Breadcrumbs, CtaBand, PageHero, RuledList, ProposalButton],
  templateUrl: './pricing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pricing {
  protected readonly ctx = inject(PageContext);
  protected readonly pad = pad2;
  protected readonly confirmed = computed(() => this.ctx._Settings.settings().confirmations.packageInclusions);
  /** Detailed inclusions are unconfirmed package terms: public only once confirmed, otherwise draft preview only. */
  protected readonly showComparison = computed(() => this.confirmed() || this.ctx._Settings.settings().publication.showDrafts);
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.pricing, path: '/pricing' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/pricing', this.ctx.d().pricing.meta)); }
}
