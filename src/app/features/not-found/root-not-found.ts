import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/** Paths outside /en and /ar. */
@Component({
  selector: 'app-root-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="notfound container">
      <img src="/brand/avera-logo-navy-on-white.png" width="511" height="210" alt="AVERA Elite Business Solutions" class="notfound__logo" />
      <h1>We could not find that page.</h1>
      <p lang="ar" dir="rtl">لم نعثر على هذه الصفحة.</p>
      <p><a class="text-link" href="/en">English</a> · <a class="text-link" href="/ar" lang="ar">العربية</a></p>
    </main>`,
})
export class RootNotFound {
  constructor() {
    const init = inject(RESPONSE_INIT, { optional: true });
    if (init) init.status = 404;
    inject(Title).setTitle('Page not found · AVERA Elite');
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
  }
}
