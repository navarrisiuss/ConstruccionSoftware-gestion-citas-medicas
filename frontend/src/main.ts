import {bootstrapApplication} from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {AppComponent} from './app/app.component';
import {appConfig} from './app/config/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(BrowserModule)
  ]
})
.catch(err => console.error(err));