import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { ProposalButton } from '@shared/components/cta-buttons';
import { Icon } from '@shared/components/icon';
import { telHref, waHref } from '@core/utils/links';

/** Phones/tablets only. Single WhatsApp placement, shown only when a number is configured; otherwise "Call". */
@Component({
  selector: 'app-mobile-bar',
  imports: [ProposalButton, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    <div class="mobile-bar">
      <app-proposal-button [label]="d.common.getProposal" extraClass="mobile-bar__main" />
      @if (whatsapp(); as wa) {
        <a class="btn btn--secondary mobile-bar__alt" [href]="wa" target="_blank" rel="noopener"><app-icon name="whatsapp" [size]="20" /><span>{{ d.common.whatsapp }}</span></a>
      } @else if (call(); as c) {
        <a class="btn btn--secondary mobile-bar__alt" [href]="c"><app-icon name="phone" [size]="20" /><span>{{ d.common.call }}</span></a>
      }
    </div>`,
})
export class MobileBar {
  protected readonly ctx = inject(PageContext);
  protected readonly whatsapp = computed(() => {
    const n = this.ctx._Settings.business().whatsapp;
    return n ? waHref(n, this.ctx.d().common.whatsappText) : null;
  });
  protected readonly call = computed(() => {
    const p = this.ctx._Settings.business().phones[0];
    return p ? telHref(p.display) : null;
  });
}
