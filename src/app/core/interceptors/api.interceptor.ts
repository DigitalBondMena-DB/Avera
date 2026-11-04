import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@env/environment';
import { LanguageService } from '@core/services/language.service';

/** Adds JSON + language headers to calls to our API only. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) return next(req);
  const lang = inject(LanguageService).lang();
  return next(req.clone({ setHeaders: { Accept: 'application/json', 'Accept-Language': lang } }));
};
