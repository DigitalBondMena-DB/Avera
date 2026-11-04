import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { PageContext } from '@core/services/page-context.service';
import { Breadcrumbs, CtaBand, DraftBanner, PageHero } from '@shared/components/parts';
import { CASE_STUDIES, CLIENT_LOGOS, TESTIMONIALS } from '../people.data';

const PATH = '/about/clients';

@Component({
  selector: 'app-clients',
  imports: [Breadcrumbs, CtaBand, DraftBanner, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = ctx.d();
    @let c = d.clients;
    @let lang = ctx.lang();
    @if (draft()) { <app-draft-banner /> }
    <app-breadcrumbs [trail]="trail()" />
    <app-page-hero [title]="c.h1" [lead]="c.intro" />
    <section class="section">
      <div class="container">
        @if (empty) { <p class="notice notice--warn">{{ c.empty }}</p> }
        @if (logos.length) {
          <h2 class="h3">{{ c.logosTitle }}</h2>
          <ul class="logo-wall">@for (l of logos; track l.id) { <li><img [src]="l.file" [alt]="l.name" [width]="l.width" [height]="l.height" loading="lazy" /></li> }</ul>
        }
        @if (testimonials.length) {
          <h2 class="h3">{{ c.testimonialsTitle }}</h2>
          @for (t of testimonials; track t.id) {
            <figure class="quote"><blockquote>{{ t.quote[lang] }}</blockquote><figcaption>{{ t.person }}, {{ t.role[lang] }}, {{ t.company }}</figcaption></figure>
          }
        }
        @for (cs of cases; track cs.id) {
          <article class="case">
            <h2 class="h3">{{ c.caseTitle }}: {{ cs.client }}</h2>
            <dl><dt>{{ c.caseLabels[0] }}</dt><dd>{{ cs.challenge[lang] }}</dd><dt>{{ c.caseLabels[1] }}</dt><dd>{{ cs.action[lang] }}</dd><dt>{{ c.caseLabels[2] }}</dt><dd>{{ cs.result[lang] }}</dd></dl>
          </article>
        }
      </div>
    </section>
    <app-cta-band [title]="d.home.finalTitle" [text]="d.home.finalText" />`,
})
export class Clients {
  protected readonly ctx = inject(PageContext);
  protected readonly logos = CLIENT_LOGOS;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly cases = CASE_STUDIES;
  protected readonly empty = !CLIENT_LOGOS.length && !TESTIMONIALS.length && !CASE_STUDIES.length;
  protected readonly draft = computed(() => this.ctx._Settings.status(PATH) === 'draft');
  protected readonly trail = computed(() => [{ label: this.ctx.d().nav.aboutAvera, path: '/about' }, { label: this.ctx.d().clients.h1, path: PATH }]);
  constructor() { effect(() => this.ctx._Seo.set(this.ctx.lang(), PATH, this.ctx.d().clients.meta, { noindex: this.draft() })); }
}
