import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { SERVICE_SLUGS } from '@core/constants/routes';
import { telHref } from '@core/utils/links';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly ctx = inject(PageContext);
  protected readonly analytics = inject(AnalyticsService);
  protected readonly biz = this.ctx._Settings.business;
  protected readonly services = SERVICE_SLUGS;
  protected readonly year = new Date().getFullYear();
  protected readonly tel = telHref;
  protected readonly trackers = computed(() => {
    const i = this.ctx._Settings.integrations();
    return !!(i.ga4Id || i.linkedinPartnerId);
  });
  protected readonly company = computed(() => {
    const n = this.ctx.d().nav;
    return [
      { p: '/about', l: n.aboutAvera }, { p: '/trust', l: n.trust }, { p: '/how-it-works', l: n.howItWorks },
      { p: '/about/leadership', l: n.leadership }, { p: '/about/clients', l: n.clients }, { p: '/insights', l: n.insights },
      { p: '/careers', l: n.careers }, { p: '/faq', l: n.faq }, { p: '/contact', l: n.contact },
    ].filter(x => this.ctx._Settings.isPublic(x.p));
  });
  protected readonly address = computed(() => {
    const a = this.biz().address, ar = this.ctx.lang() === 'ar';
    return a.confirmed ? (ar ? a.ar : a.en) : ar ? a.cityAr : a.cityEn;
  });
}
