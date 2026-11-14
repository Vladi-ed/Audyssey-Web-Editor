import { Component, output } from '@angular/core';

@Component({
    selector: 'app-export-support',
    templateUrl: './export-support.component.html',
    styleUrl: './export-support.component.scss',
})
export class ExportSupportComponent {
    readonly donateClicked = output<void>();
    readonly dismissed = output<void>();
}
