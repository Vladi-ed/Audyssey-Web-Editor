export interface ReleaseHighlights {
    version: string;
    date: string;
    highlights: string[];
}

// Newest first. Dates match the version commits recorded in CHANGELOG.md.
export const releaseHighlights: ReleaseHighlights[] = [
    {
        version: '0.9.6',
        date: '2026-10-20',
        highlights: [
            'Add info icons with tooltips in channel settings',
            'Remove trim adjustment logic and simplify channel settings form',
            'New release highlights appear after startup. Click the version number to open it anytime.',
        ],
    },
    {
        version: '0.9.5',
        date: '2026-10-19',
        highlights: [
            'Drag an ADY file onto the editor to open it.',
            'Target curves now include an estimated speaker bass rolloff. Auto crossover is shown on the graph when no custom crossover is set.',
            'Channel settings include help tooltips, and the obsolete trim adjustment has been removed.',
        ],
    },
    {
        version: '0.9.4',
        date: '2026-10-19',
        highlights: ['Target curve points stay within supported frequency and gain limits while dragging.'],
    },
    {
        version: '0.9.3',
        date: '2026-10-18',
        highlights: ['Smoother target curve editing with improved drag handling.'],
    },
    {
        version: '0.9.2',
        date: '2026-10-17',
        highlights: [
            'Choose where to save exported ADY files in browsers that support the file picker.',
        ],
    },
    {
        version: '0.9.1',
        date: '2026-10-12',
        highlights: [
            'Channel settings validate edits before applying them, with clearer controls for speaker and crossover settings.',
            'Improved validation and error feedback when editing curves and exporting files.',
        ],
    },
    {
        version: '0.9.0',
        date: '2026-10-06',
        highlights: [
            'Shared subwoofer outputs use their shared correction curve while keeping individual output settings editable.',
            'Empty subwoofer graphs are hidden, with clearer channel names.',
            'More reliable chart updates when loading files and processing measurements.',
            'Support for Directional and N/A subwoofer modes.',
            'Additional speaker channel names and more consistent subwoofer overlay behavior.'
        ],
    },
    {
        version: '0.8.0',
        date: '2026-08-11',
        highlights: [
            'Introducing Web Editor with faster initial loading.',
            'A new dark theme for the editor and charts.',
        ],
    },
    {
        version: '0.7.0',
        date: '2026-08-04',
        highlights: [
            'Updated the chart engine to Highcharts 13, with theme and compatibility improvements.',
            'More reliable channel selection and support for the SW3 channel name.',
            'Improved ADY file parsing.'
        ],
    },
    {
        version: '0.6.0',
        date: '2025-11-24',
        highlights: [
            'Fixed Enter-key handling while editing custom points and constrained offsets to −12 to +12 dB.',
            'Updated target curve rendering and added an animation when removing points.',
            'Fixed a nonzero 20 Hz offset incorrectly overriding the 20,000 Hz point.',
            'Improved notification positioning.'
        ],
    },
    {
        version: '0.5.0',
        date: '2025-08-18',
        highlights: [
            'Added Audyssey LFC controls and explanatory tooltips, including speaker distances in inches.',
            'Clearer error feedback when opening invalid ADY files.',
            'Added the Surround Back Right channel name.'
        ],
    },
    {
        version: '0.4.0',
        date: '2024-09-09',
        highlights: [
            'Added experimental support for Audyssey One ADY files.',
            'Support for editing thousands of target curve points.',
            'Improved scrolling performance for custom points.',
            'Added more speaker channel names and fixed Front Left channel selection.',
            'Fixed an error with mixed subwoofer channels.',
            'Faster measurement calculations using a new FFT library.'
        ],
    },
    {
        version: '0.3.5',
        date: '2024-02-22',
        highlights: ['Crossover validation now accounts for the selected speaker size.'],
    },
    {
        version: '0.3.4',
        date: '2024-02-17',
        highlights: ['Adjust target curve gains by dragging points directly on the graph, with stricter point validation.'],
    },
    {
        version: '0.3.3',
        date: '2024-02-07',
        highlights: [
            'Added support for two joined subwoofers and a channel selector in the graph title.',
            'Faster graph calculations and target curves that stop at the correction frequency limit.',
        ],
    },
    {
        version: '0.3.2',
        date: '2024-01-29',
        highlights: ['Improved custom point entry and graph rendering.'],
    },
    {
        version: '0.3.1',
        date: '2024-01-27',
        highlights: [
            'Copy and paste target curve points, with frequency sorting for exported files.',
            'Faster graph rendering and fixes for crossover values and chart scale switching.',
        ],
    },
    {
        version: '0.3.0',
        date: '2024-01-19',
        highlights: [
            'Added a reference curve and validation for target points between 20 and 20,000 Hz.',
            'Fixed loading multiple ADY files in one session.',
        ],
    },
    {
        version: '0.2.0',
        date: '2023-12-19',
        highlights: ['Updated the editor interface and added an example calibration file.'],
    },
    {
        version: '0.1.0',
        date: '2023-12-13',
        highlights: ['Introduced the redesigned Audyssey Editor interface.'],
    },
    {
        version: '0.0.0',
        date: '2023-04-05',
        highlights: [
            'Initial editor with ADY imports and exports, editable target curve points, and measurement graphs.',
            'Background measurement processing and an optional subwoofer graph overlay.',
            'Thank you for reading till the end!'
        ],
    },
];

function compareVersions(left: string, right: string): number {
    const leftParts = left.split('.').map(Number);
    const rightParts = right.split('.').map(Number);
    for (let index = 0; index < 3; index++) {
        const difference = leftParts[index] - rightParts[index];
        if (difference !== 0) return difference;
    }
    return 0;
}

export function getReleaseHighlights(currentVersion: string, seenVersion: string | null) {
    const validSeenVersion = seenVersion && /^\d+\.\d+\.\d+$/.test(seenVersion) ? seenVersion : null;
    return releaseHighlights.filter(release => compareVersions(release.version, currentVersion) <= 0
        && (!validSeenVersion || compareVersions(release.version, validSeenVersion) > 0));
}
