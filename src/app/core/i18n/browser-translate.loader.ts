import { HttpClient } from '@angular/common/http';
import { Injectable, TransferState, inject, makeStateKey } from '@angular/core';
import { TranslateLoader, type TranslationObject } from '@ngx-translate/core';
import { of, type Observable } from 'rxjs';

export const i18nKey = (lang: string) => makeStateKey<TranslationObject>(`i18n-${lang}`);

/** Browser: reuse the translations the server embedded (TransferState) and only fetch /i18n/<lang>.json on a language change. */
@Injectable()
export class BrowserTranslateLoader implements TranslateLoader {
  private readonly _Http = inject(HttpClient);
  private readonly _State = inject(TransferState);

  getTranslation(lang: string): Observable<TranslationObject> {
    const cached = this._State.get(i18nKey(lang), null);
    if (cached) return of(cached);
    return this._Http.get<TranslationObject>(`/i18n/${lang}.json`);
  }
}
