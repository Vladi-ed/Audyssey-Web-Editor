import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { version } from '../../../package.json';
import { getReleaseHighlights } from './release-highlights';

export { getReleaseHighlights } from './release-highlights';

const highlightIcons = {
    info: 'M12 8h.01 M11 12h1v5 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    settings: 'M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6',
    history: 'M3 11a9 9 0 1 1 3 8 M3 4v7h7 M12 7v5l3 2',
    upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
    curve: 'M3 4v16h18M5 16c3 0 3-9 7-9s4 6 9 6',
    check: 'M8 12l3 3 5-6M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
};

@Component({
    selector: 'app-whats-new',
    imports: [MatDialogContent, MatDialogActions, MatDialogClose],
    templateUrl: './whats-new.component.html',
    styleUrl: './whats-new.component.scss',
})
export class WhatsNewComponent {
    private data = inject<{ seenVersion: string | null; announcement: boolean }>(MAT_DIALOG_DATA);
    private dateFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
    readonly appVersion = version;
    readonly isAnnouncement = this.data.announcement;
    readonly releases = getReleaseHighlights(this.appVersion, this.data.seenVersion).map(release => ({
        ...release,
        displayDate: this.dateFormatter.format(new Date(`${release.date}T00:00:00Z`)),
    }));
    readonly announcementHighlights = this.releases.flatMap(release =>
        release.highlights.map((text, index) => ({
            text,
            iconPath: highlightIcons[release.icons?.[index] ?? 'check'],
        })),
    ).slice(0, 4);
}
