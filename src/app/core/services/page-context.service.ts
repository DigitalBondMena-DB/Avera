import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import { LanguageService } from './language.service';
import { SettingsService } from './settings.service';
import { SeoService } from './seo.service';

/** Bundles what every page needs: typed dictionary, language, settings, SEO and a localised path helper. */
@Injectable({ providedIn: 'root' })
export class PageContext {
  readonly _Language = inject(LanguageService);
  readonly _Settings = inject(SettingsService);
  readonly _Seo = inject(SeoService);
  readonly d = inject(ContentService).d;
  readonly lang = this._Language.lang;
  readonly L = (p: string): string => this._Language.path(p);
}
