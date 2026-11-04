import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { GULF_SLUGS } from '@core/constants/routes';
import { Icon } from '@shared/components/icon';
import { Photo } from '@shared/components/photo';
import { ArrowLink, Breadcrumbs, CtaBand, RuledList } from '@shared/components/parts';
import { ProposalButton, ConsultationButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-markets-hub',
  imports: [RouterLink, Icon, Photo, ArrowLink, Breadcrumbs, CtaBand, RuledList, ProposalButton, ConsultationButton],
  templateUrl: './markets-hub.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsHub {
  protected readonly ctx = inject(PageContext);
  protected readonly gulf = GULF_SLUGS;
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.markets, path: '/markets' }]);
  constructor() {
    effect(() => this.ctx._Seo.set(this.ctx.lang(), '/markets', this.ctx.d().marketsHub.meta));
  }
}
