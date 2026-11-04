import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { SERVICE_GROUPS, SERVICE_SLUGS } from '@core/constants/routes';
import { pad2 } from '@core/utils/links';
import { Icon } from '@shared/components/icon';
import { Breadcrumbs, CtaBand, PageHero } from '@shared/components/parts';
import { ConsultationButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-services-hub',
  imports: [RouterLink, Icon, Breadcrumbs, CtaBand, PageHero, ConsultationButton],
  templateUrl: './services-hub.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesHub {
  protected readonly ctx = inject(PageContext);
  protected readonly groups = SERVICE_GROUPS;
  protected readonly pad = pad2;
  protected readonly all = computed(() => SERVICE_SLUGS.map(s => this.ctx.d().services[s]));
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.services, path: '/services' }]);
  constructor() {
    effect(() => this.ctx._Seo.set(this.ctx.lang(), '/services', this.ctx.d().servicesHub.meta));
  }
}
