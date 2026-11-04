import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { IMAGE_CONFIG, IMAGE_LOADER } from '@angular/common';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { BrowserTranslateLoader } from '@core/i18n/browser-translate.loader';
import { apiInterceptor } from '@core/interceptors/api.interceptor';
import { SettingsService } from '@core/services/settings.service';
import { averaImageLoader, IMAGE_BREAKPOINTS } from '@core/utils/image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideClientHydration(withEventReplay(), withIncrementalHydration(), withHttpTransferCacheOptions({ includeHeaders: [] })),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    provideTranslateService({ loader: provideTranslateLoader(BrowserTranslateLoader), fallbackLang: 'en' }),
    provideAppInitializer(() => firstValueFrom(inject(SettingsService).load())),
    { provide: IMAGE_LOADER, useValue: averaImageLoader },
    { provide: IMAGE_CONFIG, useValue: { breakpoints: IMAGE_BREAKPOINTS, placeholderResolution: 40 } },
  ],
};
