import { Injectable, computed, inject } from '@angular/core';
import { LanguageService } from './language.service';
import type { IDictionary } from '@core/models/content.model';

/** Typed access to the current dictionary. Routes only render after the language has loaded. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _Language = inject(LanguageService);
  readonly d = computed<IDictionary>(() => {
    const d = this._Language.dict();
    if (!d) throw new Error('Dictionary not loaded');
    return d;
  });
  fmt(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  }
}
