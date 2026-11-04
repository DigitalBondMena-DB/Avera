import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';
import { GULF_SLUGS, SERVICE_SLUGS } from '@core/constants/routes';
import { environment } from '@env/environment';
import { pad2 } from '@core/utils/links';
import { Icon } from '@shared/components/icon';
import { Photo } from '@shared/components/photo';
import { ArrowLink } from '@shared/components/parts';
import { ProposalButton, ConsultationButton, DocumentsButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, Photo, ArrowLink, ProposalButton, ConsultationButton, DocumentsButton],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly ctx = inject(PageContext);
  protected readonly services = SERVICE_SLUGS;
  protected readonly gulf = GULF_SLUGS;
  protected readonly pad = pad2;
  protected readonly biz = this.ctx._Settings.business;

  /** Second entry point shows the guide only once it is published; otherwise How it works. */
  protected readonly entries = computed(() => {
    const h = this.ctx.d().home;
    const guide = this.ctx._Settings.isPublic('/guides/hiring-in-egypt');
    return [
      { ...h.entries[0], path: '/services/employer-of-record', fragment: undefined },
      guide ? { ...h.guideEntry, path: '/guides/hiring-in-egypt', fragment: undefined } : { ...h.entries[1], path: '/how-it-works', fragment: undefined },
      { ...h.entries[2], path: '/trust', fragment: 'questions' },
    ];
  });
  protected readonly trustItems = computed(() => this.ctx._Settings.confirmed(this.ctx.d().home.trustItems));

  constructor() {
    effect(() => {
      const d = this.ctx.d(), lang = this.ctx.lang(), b = this.biz();
      this.ctx._Seo.set(lang, '/', d.home.meta);
      this.ctx._Seo.jsonLd('organization', {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'ProfessionalService'],
        name: b.name.en,
        alternateName: b.name.ar,
        url: environment.siteUrl,
        logo: `${environment.siteUrl}/brand/avera-logo-navy-on-white.png`,
        email: b.email,
        telephone: b.phones[0]?.display.replace(/\s/g, ''),
        contactPoint: b.phones.map(p => ({ '@type': 'ContactPoint', telephone: p.display.replace(/\s/g, ''), contactType: 'sales', areaServed: p.region })),
        areaServed: ['EG', 'SA', 'AE', 'QA', 'KW'],
        ...(b.address.confirmed && b.address.en ? { address: { '@type': 'PostalAddress', streetAddress: b.address.en, addressLocality: 'Cairo', addressCountry: 'EG' } } : {}),
        ...(b.linkedinUrl ? { sameAs: [b.linkedinUrl] } : {}),
      });
    });
  }
}
