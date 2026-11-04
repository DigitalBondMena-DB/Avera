import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { LeadService } from '@core/services/lead.service';
import { ModalDirective } from '@shared/directives/modal.directive';
import { Icon } from '@shared/components/icon';
import { ProposalForm } from '@shared/components/forms/proposal-form';
import { SimpleLeadForm } from '@shared/components/forms/simple-lead-form';

/** Side panel on desktop (inline-end), full screen on phones. */
@Component({
  selector: 'app-lead-drawer',
  imports: [ModalDirective, Icon, ProposalForm, SimpleLeadForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lead.drawer(); as state) {
      @let t = titles();
      <div class="drawer-root">
        <div class="drawer-scrim" (click)="lead.close()" aria-hidden="true"></div>
        <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" appModal (appModalEscape)="lead.close()">
          <div class="drawer__head">
            <div>
              <h2 class="drawer__title" id="drawer-title">{{ t?.title }}</h2>
              <p class="drawer__intro">{{ t?.intro }}</p>
            </div>
            <button type="button" class="icon-btn" (click)="lead.close()" [attr.aria-label]="ctx.d().common.close"><app-icon name="close" [size]="22" /></button>
          </div>
          <div class="drawer__body">
            @if (state.kind === 'proposal') { <app-proposal-form /> }
            @else { <app-simple-lead-form [kind]="state.kind" /> }
          </div>
        </div>
      </div>
    }`,
})
export class LeadDrawer {
  protected readonly ctx = inject(PageContext);
  protected readonly lead = inject(LeadService);
  private readonly _Document = inject(DOCUMENT);
  protected readonly titles = computed(() => {
    const s = this.lead.drawer();
    return s ? this.ctx.d().forms[s.kind] : null;
  });
  constructor() {
    effect(() => this._Document.documentElement.toggleAttribute('data-drawer-open', !!this.lead.drawer()));
  }
}
