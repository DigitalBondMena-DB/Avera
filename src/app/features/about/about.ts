import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Photo } from '@shared/components/photo';
import { ArrowLink, Breadcrumbs, CtaBand, RuledList } from '@shared/components/parts';
import { ConsultationButton } from '@shared/components/cta-buttons';

@Component({
  selector: 'app-about',
  imports: [Photo, ArrowLink, Breadcrumbs, CtaBand, RuledList, ConsultationButton],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly ctx = inject(PageContext);
  protected readonly links = computed(() => {
    const n = this.ctx.d().nav;
    return [
      { p: '/trust', l: n.trust }, { p: '/how-it-works', l: n.howItWorks }, { p: '/about/leadership', l: n.leadership },
      { p: '/about/clients', l: n.clients }, { p: '/careers', l: n.careers },
    ].filter(x => this.ctx._Settings.isPublic(x.p));
  });
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.aboutAvera, path: '/about' }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), '/about', this.ctx.d().about.meta)); }
}
