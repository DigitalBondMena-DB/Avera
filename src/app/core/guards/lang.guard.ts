import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { map, of } from 'rxjs';
import { LANGS, type Lang } from '@core/constants/routes';
import { LanguageService } from '@core/services/language.service';

/** Matches only /en and /ar, and loads that language before any child renders. */
export const langMatch: CanMatchFn = (_route, segments) => {
  const lang = segments[0]?.path;
  if (!LANGS.includes(lang as Lang)) return of(false);
  return inject(LanguageService).use(lang as Lang).pipe(map(() => true));
};
