import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { AnalyticsService } from '@core/services/analytics.service';

/** Only rendered when a tracker is configured. Reject is as easy as Accept. */
@Component({
  selector: 'app-consent',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (analytics.bannerOpen()) {
      @let c = ctx.d().consent;
      <section class="consent" role="region" [attr.aria-label]="c.title">
        <div class="consent__text">
          <p class="consent__title">{{ c.title }}</p>
          <p>{{ c.text }} <a [routerLink]="ctx.L('/cookies')">{{ c.policy }}</a></p>
        </div>
        <div class="consent__actions">
          <button type="button" class="btn btn--secondary" (click)="analytics.choose('denied')">{{ c.reject }}</button>
          <button type="button" class="btn btn--primary" (click)="analytics.choose('granted')">{{ c.accept }}</button>
        </div>
      </section>
    }`,
})
export class Consent {
  protected readonly ctx = inject(PageContext);
  protected readonly analytics = inject(AnalyticsService);
  constructor() {
    afterNextRender(() => {
      const i = this.ctx._Settings.integrations();
      this.analytics.init(i.ga4Id, i.linkedinPartnerId);
    });
  }
}
