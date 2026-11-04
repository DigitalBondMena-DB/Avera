import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { LeadService } from '@core/services/lead.service';
import { Breadcrumbs, ContactLines } from '@shared/components/parts';
import { ProposalForm } from '@shared/components/forms/proposal-form';
import { SimpleLeadForm } from '@shared/components/forms/simple-lead-form';

/** Contact: the canonical proposal flow inline, plus the consultation path. Reads ?country, ?service, ?tab. */
@Component({
  selector: 'app-contact',
  imports: [Breadcrumbs, ContactLines, ProposalForm, SimpleLeadForm],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly ctx = inject(PageContext);
  private readonly _Route = inject(ActivatedRoute);
  private readonly _Lead = inject(LeadService);
  protected readonly tab = signal(0);
  protected readonly bookingUrl = computed(() => this.ctx._Settings.integrations().bookingUrl);
  protected readonly office = computed(() => {
    const a = this.ctx._Settings.business().address, ar = this.ctx.lang() === 'ar';
    return a.confirmed ? (ar ? a.ar : a.en) : ar ? a.cityAr : a.cityEn;
  });
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.contact, path: '/contact' }]);

  constructor() {
    const q = this._Route.snapshot.queryParamMap;
    const country = q.get('country') ?? undefined, service = q.get('service') ?? undefined;
    if (country || service) this._Lead.prefill.set({ country, service });
    if (q.get('tab') === 'consultation' || this._Route.snapshot.fragment === 'consultation') this.tab.set(1);
    effect(() => this.ctx._Seo.set(this.ctx.lang(), '/contact', this.ctx.d().contact.meta));
  }

  protected onKey(e: KeyboardEvent, list: HTMLElement): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const n = this.tab() === 0 ? 1 : 0;
    this.tab.set(n);
    list.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus();
  }
}
