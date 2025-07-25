/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js';
import 'swiper/element/bundle';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
