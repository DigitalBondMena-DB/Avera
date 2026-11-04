import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { telHref } from '@core/utils/links';
import { Icon } from '../icon';

@Component({
  selector: 'app-direct-contacts',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = ctx.d().common;
    <ul class="direct-list">
      <li><app-icon name="mail" /><a [href]="'mailto:' + biz().email"><bdi dir="ltr">{{ biz().email }}</bdi></a></li>
      @for (p of biz().phones; track p.id) {
        <li><app-icon name="phone" /><span class="direct-list__label">{{ p.region === 'SA' ? c.ksa : c.egypt }}</span><a [href]="tel(p.display)"><bdi dir="ltr">{{ p.display }}</bdi></a></li>
      }
    </ul>`,
})
export class DirectContacts {
  protected readonly ctx = inject(PageContext);
  protected readonly biz = this.ctx._Settings.business;
  protected readonly tel = telHref;
}

/** Banner shown before submitting when no delivery channel is connected (honest preview). */
@Component({
  selector: 'app-mode-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (!live()) { <p class="mode-banner" role="note">{{ ctx.d().forms.previewBanner }}</p> }`,
})
export class ModeBanner {
  protected readonly ctx = inject(PageContext);
  protected readonly live = computed(() => this.ctx._Settings.integrations().leadsLive);
}

@Component({
  selector: 'app-form-outcome',
  imports: [DirectContacts],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let f = ctx.d().forms;
    @switch (outcome()) {
      @case ('preview') {
        <div class="notice notice--warn" role="alert">
          <p class="notice__title">{{ f.previewTitle }}</p>
          <p>{{ f.previewText }}</p>
          <app-direct-contacts />
        </div>
      }
      @case (null) {}
      @default {
        <div class="notice notice--error" role="alert">
          <p>{{ outcome() === 'network' ? f.errors.network : outcome() === 'rate_limited' ? f.errors.rateLimited : f.errors.generic }}</p>
          <app-direct-contacts />
        </div>
      }
    }`,
})
export class FormOutcome {
  protected readonly ctx = inject(PageContext);
  readonly outcome = input.required<'preview' | 'network' | 'rate_limited' | 'generic' | null>();
}

@Component({
  selector: 'app-privacy-line',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="form__privacy">{{ parts()[0] }}<a [routerLink]="ctx.L('/privacy')">{{ ctx.d().forms.privacyLink }}</a>{{ parts()[1] }} {{ response() }}</p>`,
})
export class PrivacyLine {
  protected readonly ctx = inject(PageContext);
  protected readonly parts = computed(() => this.ctx.d().forms.privacy.split('{privacy}'));
  protected readonly response = computed(() => {
    const c = this.ctx.d().common;
    return this.ctx._Settings.business().responseSlaConfirmed ? c.responseSla : c.responseNeutral;
  });
}
