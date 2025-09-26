import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { OAuthModule } from 'angular-oauth2-oidc';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    importProvidersFrom(FormsModule),  //[(ngModel)]
    provideRouter(routes),
    importProvidersFrom(OAuthModule.forRoot()) //oauth
  ]
}).catch((err) => console.error(err));
