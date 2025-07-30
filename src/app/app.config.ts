import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import {
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from '../translate-loader';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { CommonPropInfoService } from './pages/property-info/common-prop-info-service';

export const appConfig: ApplicationConfig = {
  providers: [
      {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },CommonPropInfoService,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    importProvidersFrom(NgxDaterangepickerMd.forRoot()),

    provideZoneChangeDetection(),

    
    //  importProvidersFrom(GoogleMapsModule)
    // provideZonelessChangeDetection(),
  ],
};
