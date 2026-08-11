import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideHighcharts } from 'highcharts-angular';
import { initOptions } from './app/helper-functions/highcharts-options';

bootstrapApplication(AppComponent, {
    providers: [
        provideBrowserGlobalErrorListeners(),
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { verticalPosition: 'top' } },
        provideHighcharts({
            instance: () => import('highcharts/esm/highcharts').then(module => module.default),
            modules: () => [
                import('highcharts/esm/modules/draggable-points'),
                import('highcharts/esm/modules/exporting'),
            ],
            options: initOptions,
        }),
    ]
}).catch(err => console.error(err));
