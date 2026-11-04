import { ChangeDetectionStrategy, Component, effect, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContext } from '@core/services/page-context.service';

/** Localized 404 inside the layout; real 404 status on the server. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let n = ctx.d().notFound;
    <section class="section notfound-local">
      <div class="container">
        <span class="diamond-rule" aria-hidden="true"></span>
        <p class="eyebrow">404</p>
        <h1 class="page-hero__title">{{ n.h1 }}</h1>
        <p class="page-hero__lead">{{ n.text }}</p>
        <ul class="inline-links inline-links--arrows">
          <li><a class="text-link" [routerLink]="ctx.L('/')">{{ n.home }}</a></li>
          <li><a class="text-link" [routerLink]="ctx.L('/services')">{{ n.services }}</a></li>
          <li><a class="text-link" [routerLink]="ctx.L('/contact')">{{ n.contact }}</a></li>
        </ul>
      </div>
    </section>`,
})
export class NotFound {
  protected readonly ctx = inject(PageContext);
  constructor() {
    const init = inject(RESPONSE_INIT, { optional: true });
    if (init) init.status = 404;
    effect(() => {
      const n = this.ctx.d().notFound;
      this.ctx._Seo.set(this.ctx.lang(), '/404', n.meta, { noindex: true });
    });
  }
}
