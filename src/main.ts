import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideHighcharts } from 'highcharts-angular';

bootstrapApplication(AppComponent, {
    providers: [
        provideBrowserGlobalErrorListeners(),
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { verticalPosition: 'top' } },
        provideHighcharts(),
    ]
}).catch(err => console.error(err));
