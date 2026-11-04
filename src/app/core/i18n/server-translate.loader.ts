import { Injectable, TransferState, inject } from '@angular/core';
import { TranslateLoader, type TranslationObject } from '@ngx-translate/core';
import { of, type Observable } from 'rxjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { i18nKey } from './browser-translate.loader';

const cache = new Map<string, TranslationObject>();

function resolveFile(lang: string): string {
  const candidates = [
    join(import.meta.dirname ?? '', '../browser/i18n', `${lang}.json`), // built server bundle
    join(process.cwd(), 'dist/avera-web/browser/i18n', `${lang}.json`),
    join(process.cwd(), 'public/i18n', `${lang}.json`), // ng serve
  ];
  const found = candidates.find(f => existsSync(f));
  if (!found) throw new Error(`i18n file for "${lang}" not found`);
  return found;
}

/** Server: read the JSON from disk (no HTTP round-trip) and hand it to the browser via TransferState. */
@Injectable()
export class ServerTranslateLoader implements TranslateLoader {
  private readonly _State = inject(TransferState);

  getTranslation(lang: string): Observable<TranslationObject> {
    if (!cache.has(lang)) cache.set(lang, JSON.parse(readFileSync(resolveFile(lang), 'utf8')) as TranslationObject);
    const t = cache.get(lang)!;
    this._State.set(i18nKey(lang), t);
    return of(t);
  }
}
