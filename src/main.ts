import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideZoneChangeDetection } from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), provideZoneChangeDetection({ eventCoalescing: true })]
}).catch(err => console.error(err));
