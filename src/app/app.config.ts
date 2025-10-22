import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, 
  provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

import { AppConfigService } from './services/app-config-service';


export function initializeAppConfig(appConfigService: AppConfigService) {
  return () => appConfigService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    //config
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [AppConfigService],
      multi: true
    }
  ]
};
