import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { environment } from '@env/environment';
import type { ServiceSlug } from '@core/models/content.model';
import { Icon } from '@shared/components/icon';
import { Photo } from '@shared/components/photo';
import { ArrowLink, Breadcrumbs, CtaBand, FaqList, PageHero, RelatedServices, RuledList, Steps } from '@shared/components/parts';
import { ProposalButton, ConsultationButton } from '@shared/components/cta-buttons';

/** Data-driven template; each service has its own content, metadata and FAQ. */
@Component({
  selector: 'app-service-detail',
  imports: [Icon, Photo, ArrowLink, Breadcrumbs, CtaBand, FaqList, PageHero, RelatedServices, RuledList, Steps, ProposalButton, ConsultationButton],
  templateUrl: './service-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetail {
  protected readonly ctx = inject(PageContext);
  /** Bound from the :slug route param (withComponentInputBinding); validated by slugMatch. */
  readonly slug = input.required<ServiceSlug>();
  protected readonly s = computed(() => this.ctx.d().services[this.slug()]);
  protected readonly ui = computed(() => this.ctx.d().serviceUi);
  protected readonly includedCols = computed<1 | 2>(() => (this.ctx._Settings.confirmed(this.s().included).length > 3 ? 2 : 1));
  protected readonly hasFaq = computed(() => this.ctx._Settings.confirmed(this.s().faq).length > 0);
  protected readonly trail = computed(() => [
    { label: this.ctx.d().nav.services, path: '/services' },
    { label: this.s().name, path: `/services/${this.slug()}` },
  ]);

  constructor() {
    effect(() => {
      const s = this.s(), lang = this.ctx.lang(), path = `/services/${this.slug()}`;
      this.ctx._Seo.set(lang, path, s.meta);
      this.ctx._Seo.jsonLd('service', {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: s.name,
        description: s.meta.description,
        serviceType: s.name,
        areaServed: { '@type': 'Country', name: 'Egypt' },
        provider: { '@type': 'Organization', name: this.ctx._Settings.business().name[lang], url: environment.siteUrl },
        url: this.ctx._Seo.url(lang, path),
      });
    });
  }
}
