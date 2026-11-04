import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideTranslateLoader } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerTranslateLoader } from '@core/i18n/server-translate.loader';
import { TranslateLoader } from '@ngx-translate/core';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { ...provideTranslateLoader(ServerTranslateLoader), provide: TranslateLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
