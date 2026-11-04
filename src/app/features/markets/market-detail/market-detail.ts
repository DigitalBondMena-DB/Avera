import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { MARKET_SLUGS } from '@core/constants/routes';
import type { MarketSlug } from '@core/models/content.model';
import { Icon } from '@shared/components/icon';
import { Breadcrumbs, ContactLines, CtaBand, RuledList, Steps } from '@shared/components/parts';
import { ProposalButton, ConsultationButton } from '@shared/components/cta-buttons';

/** One template, five markets (four Gulf countries + International). CTAs preselect the country. */
@Component({
  selector: 'app-market-detail',
  imports: [RouterLink, Icon, Breadcrumbs, ContactLines, CtaBand, RuledList, Steps, ProposalButton, ConsultationButton],
  templateUrl: './market-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketDetail {
  protected readonly ctx = inject(PageContext);
  readonly slug = input.required<MarketSlug>();
  protected readonly m = computed(() => this.ctx.d().markets[this.slug()]);
  protected readonly others = computed(() => MARKET_SLUGS.filter(s => s !== this.slug()));
  protected readonly trail = computed(() => [
    { label: this.ctx.d().nav.markets, path: '/markets' },
    { label: this.m().name, path: `/markets/${this.slug()}` },
  ]);
  constructor() {
    effect(() => this.ctx._Seo.set(this.ctx.lang(), `/markets/${this.slug()}`, this.m().meta));
  }
}
