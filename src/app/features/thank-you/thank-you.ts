import { ChangeDetectionStrategy, Component, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { LeadService } from '@core/services/lead.service';
import { ArrowLink } from '@shared/components/parts';

/** Confirms only when this tab received a server acknowledgement; otherwise neutral copy. Always noindex. */
@Component({
  selector: 'app-thank-you',
  imports: [ArrowLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let t = d.thankYou;
    <section class="section page-hero--ivory thanks">
      <div class="container thanks__inner">
        <span class="diamond-rule" aria-hidden="true"></span>
        @switch (ack()) {
          @case (true) { <h1 class="page-hero__title">{{ t.h1 }}</h1><p class="page-hero__lead">{{ text() }}</p> }
          @case (false) { <h1 class="page-hero__title">{{ t.h1.split('.')[0] }}.</h1><p class="page-hero__lead">{{ t.noAck }}</p> }
          @default { <h1 class="page-hero__title">&nbsp;</h1> }
        }
        <p class="eyebrow thanks__next">{{ t.next }}</p>
        <ul class="inline-links inline-links--arrows">@for (l of t.links; track l.href) { <li><app-arrow-link [to]="ctx.L(l.href)">{{ l.label }}</app-arrow-link></li> }</ul>
      </div>
    </section>`,
})
export class ThankYou {
  protected readonly ctx = inject(PageContext);
  private readonly _Lead = inject(LeadService);
  protected readonly ack = signal<boolean | null>(null);
  protected readonly text = computed(() => this.ctx._Settings.business().responseSlaConfirmed ? this.ctx.d().common.responseSla : this.ctx.d().thankYou.text);
  constructor() {
    afterNextRender(() => this.ack.set(this._Lead.consumeAck()));
    effect(() => this.ctx._Seo.set(this.ctx.lang(), '/thank-you', this.ctx.d().thankYou.meta, { noindex: true }));
  }
}
