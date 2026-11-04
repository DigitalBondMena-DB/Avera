import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, type Observable } from 'rxjs';
import { DEFAULT_LANG, type Lang } from '@core/constants/routes';
import type { IDictionary } from '@core/models/content.model';

/** Owns the current language, <html lang dir>, and the typed dictionary loaded through ngx-translate. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _Translate = inject(TranslateService);
  private readonly _Document = inject(DOCUMENT);
  readonly lang = signal<Lang>(DEFAULT_LANG);
  readonly dict = signal<IDictionary | null>(null);

  use(lang: Lang): Observable<true> {
    return this._Translate.use(lang).pipe(
      map(translations => {
        this.lang.set(lang);
        this.dict.set(translations as unknown as IDictionary);
        const html = this._Document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';
        return true as const;
      }),
    );
  }

  /** Localised path: L('/services') → '/ar/services'. */
  path(p: string, lang: Lang = this.lang()): string {
    return `/${lang}${p === '/' ? '' : p}`;
  }
}
