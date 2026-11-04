import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { pad2 } from '@core/utils/links';
import { Photo } from '@shared/components/photo';
import { Breadcrumbs, CtaBand } from '@shared/components/parts';
import { DocumentsButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-trust',
  imports: [Photo, Breadcrumbs, CtaBand, DocumentsButton],
  templateUrl: './trust.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trust {
  protected readonly ctx = inject(PageContext);
  protected readonly pad = pad2;
  protected readonly biz = this.ctx._Settings.business;
  protected readonly commitments = computed(() => this.ctx._Settings.confirmed(this.ctx.d().trust.commitments));
  /** Registration facts are only listed when real values are configured. */
  protected readonly facts = computed(() => {
    const t = this.ctx.d().trust, r = this.biz().registration;
    return [
      { k: t.factsCr, v: r.commercialRegister },
      { k: t.factsTax, v: r.taxCard },
      { k: t.factsInsurance, v: r.socialInsuranceFile },
    ].filter((f): f is { k: string; v: string } => !!f.v);
  });
  protected readonly address = computed(() => {
    const a = this.biz().address;
    return a.confirmed ? (this.ctx.lang() === 'ar' ? a.ar : a.en) : null;
  });
  protected readonly trail = computed(() => [{ label: this.ctx.d().trust.eyebrow, path: '/trust' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/trust', this.ctx.d().trust.meta)); }
}
