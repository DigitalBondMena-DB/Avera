import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import type { Lang } from '@core/constants/routes';

/** Links to the same page in the other language, keeping the query string and hash. */
@Component({
  selector: 'app-lang-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a [href]="target()" [attr.hreflang]="other()" [attr.lang]="other()" [title]="title()" [class]="'lang-switch ' + extraClass()" (click)="go($event)">{{ label() }}</a>`,
})
export class LangSwitch {
  private readonly _Language = inject(LanguageService);
  private readonly _Router = inject(Router);
  private readonly _Document = inject(DOCUMENT);
  readonly label = input.required<string>();
  readonly title = input('');
  readonly extraClass = input('');
  protected readonly other = computed<Lang>(() => (this._Language.lang() === 'en' ? 'ar' : 'en'));
  protected readonly target = computed(() => {
    this._Language.lang();
    const path = this._Router.url.split(/[?#]/)[0];
    return path.replace(/^\/(en|ar)(?=\/|$)/, `/${this.other()}`);
  });
  go(e: MouseEvent): void {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const loc = this._Document.defaultView?.location;
    const path = (loc?.pathname ?? '/').replace(/^\/(en|ar)(?=\/|$)/, `/${this.other()}`);
    // Full navigation: the server renders the other language with correct lang/dir and metadata.
    loc?.assign(path + (loc.search ?? '') + (loc.hash ?? ''));
  }
}
