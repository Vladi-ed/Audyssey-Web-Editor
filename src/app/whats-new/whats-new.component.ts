import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { version } from '../../../package.json';
import { getReleaseHighlights } from './release-highlights';

export { getReleaseHighlights } from './release-highlights';

@Component({
    selector: 'app-whats-new',
    imports: [MatDialogContent, MatDialogActions, MatDialogClose],
    templateUrl: './whats-new.component.html',
    styleUrl: './whats-new.component.scss',
})
export class WhatsNewComponent {
    private data = inject<{ seenVersion: string | null }>(MAT_DIALOG_DATA);
    private dateFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
    readonly appVersion = version;
    readonly releases = getReleaseHighlights(this.appVersion, this.data.seenVersion).map(release => ({
        ...release,
        displayDate: this.dateFormatter.format(new Date(`${release.date}T00:00:00Z`)),
    }));
}
