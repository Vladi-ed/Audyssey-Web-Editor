# ADY Web Editor

ADY Web Editor is an independent web application for inspecting, editing, and exporting `.ady` room-calibration files compatible with Audyssey MultEQ.

## 🎯 Overview


ADY Web Editor allows users:

- **Edit MultEQ \*.ady files** - Modify Audyssey room correction calibration files
- **Analyze speaker frequency response** - Visualize and understand audio equipment performance
- **Adjust target curves** - Fine-tune audio calibration parameters
- **Export configurations** - Save modified calibration settings

## 🚀 Live Version

Available online at: **https://audyssey.pages.dev**

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6MK9TT)

## Using the editor

1. Keep a backup of your original calibration. Choose **Import ADY File**, drop an
   `.ady` file onto the editor, or choose **Load Example** to explore the interface.
2. Select a channel and edit its settings or target curve.
3. When editing the target-point list, click **Save** to apply those points before
   exporting, changing channels, loading another file, or dragging graph points.
   List edits remain a local draft until Save; there is currently no confirmation
   before replacing that draft.
4. Choose **Export** to save an `.ady` copy. Fix any highlighted invalid values
   first. Browsers with a supported save-file picker show a save dialog; other
   browsers download the file.
5. Open the exported copy in MultEQ and check the calibration before transferring
   it to your receiver. Reopening it in this editor alone does not verify receiver
   compatibility.

## 🛠️ Technology Stack

### Core Framework
- **Angular 22** - Application framework and build system
- **TypeScript 6** - Type-safe development

### UI Components
- **Angular Material** - Material Design components

### Data Visualization
- **Highcharts** - Advanced charting library for frequency response visualization

### Audio Processing
- **FFT.js** - Fast Fourier Transform library for audio signal processing
- **Web Workers** - Background processing for intensive calculations

## 📁 Project Structure

```
src/
├── app/
│   ├── channel-info/              # Channel settings and validation
│   ├── channel-selector/          # Audio channel selection
│   ├── contact/                   # Feedback dialog
│   ├── export-support/            # Contribution prompt
│   ├── target-curve-points/       # Target-point list editor
│   ├── whats-new/                 # Release dialog and highlights
│   ├── helper-functions/          # Import, export, graph processing, Worker
│   ├── interfaces/                # TypeScript data models
│   └── app.component.*            # Main application component
└── assets/
    ├── example-2-subs.ady         # Built-in sample calibration
    ├── favicon-options/          # Alternative favicon assets
    └── ...                       # Images, icons, and link previews
functions/                        # Cloudflare Pages API handlers
research/                         # Local research and release-planning material
```

## 🎵 Audio Processing Features

### Supported File Formats
- **MultEQ .ady files** - Audyssey room correction calibration files created by the Android or iOS app
- **Audyssey One .ady files** - Experimental support

### Core Capabilities

#### 1. Channel Processing
- Multi-channel audio analysis
- Channel-specific frequency response visualization
- Individual channel calibration adjustments

#### 2. Frequency Response Analysis
- Real-time FFT processing
- Frequency domain visualization
- Magnitude response charts with optional smoothing
- First-measurement and compatible-measurement averaging modes

#### 3. Target Curve Management
- Custom target curve creation
- Curve point manipulation
- Mathematical curve fitting

The displayed target includes an estimated low-frequency rolloff, using the first
measurement's FFT response to fit the cutoff candidates recovered from Android.
Left/right speakers share the higher estimate; subwoofers use their own low-end
reference band. Cutoffs below 40 Hz leave the target unfiltered. The estimate is
independent of manual crossover settings and is never saved into the ADY file.
When crossover is Auto, the graph shades up to this estimate and labels it
"Auto crossover". The estimated value is logged to the console without
receiver-specific rounding. A custom crossover takes precedence.
Custom gains use quadratic interpolation in logarithmic frequency.
The rounded base/MRC anchors and measurement processing remain approximations;
this does not reproduce Audyssey's native DSP or generate receiver filters.

## Data sent by the current application

The editor reads ADY files and calculates graphs locally. Its API requests do not
upload the complete ADY file or measurement samples.

The browser stores the theme, last acknowledged release version, and export
counter in local storage. This is not automatic saving of the edited ADY document.


## 🔧 Development

### HTML template formatting

Tags with more than three attributes use one attribute per line. Boolean attributes,
Angular bindings, and event handlers all count as attributes. Tags with three
or fewer attributes keep their existing layout.

```html
<input
    [disabled]="disabled()"
    [ngModel]="channel.customDistance"
    matInput
    name="customDistance"
>
```

### Architecture

The application follows Angular's component-based architecture with:

- **Feature Components** - Modular UI components for specific functionality
- **Helper Functions** - Utility libraries for audio processing
- **Web Workers** - Background processing for intensive calculations
- **Custom Pipes** - Data transformation and formatting
- **TypeScript Interfaces** - Strong typing for audio data models

### Key Components

#### Channel Selector
Manages audio channel selection and routing for multi-channel audio systems.

#### Target Curve Points
Handles target curve data manipulation with custom pipes for audio processing.

#### Helper Functions
- **AFR Processing** - Audio Frequency Response calculations
- **Audyssey Interface** - File format parsing and generation
- **Crossover Processing** - Speaker crossover analysis
- **Background Calculator** - Web Worker for intensive computations

### Release notes

For each release:

1. Update `version` in `package.json` (and the lockfile through npm).
2. Add significant user-facing highlights to
   `src/app/whats-new/release-highlights.ts`, newest version first, with an ISO
   date (`YYYY-MM-DD`) matching the version commit. Versions with
   only maintenance changes can be omitted from the highlights.
3. Update `CHANGELOG.md` with detailed changes, using Git commit messages as
   the source. Move any Unreleased entries into the appropriate version section.
4. Run `npm run build`.
   Check automatic opening, dismissal, and reopening through the version button
   at `http://localhost:4200`.

## 📊 Data Visualization

### Highcharts Integration
- Interactive frequency response charts
- Real-time data updates
- Zoom and pan functionality
- Chart image export (PNG and SVG)

### Mathematical Processing
- Fast Fourier Transform (FFT) analysis
- Digital signal processing algorithms
- Statistical analysis of audio data
- Curve fitting and interpolation

## 🤝 Contributing

For a bug report, use the in-app feedback form or
[GitHub Issues](https://github.com/Vladi-ed/Audyssey-Editor/issues). Include the
app version, browser and OS versions, steps to reproduce, and expected versus
actual behavior. If a sample ADY is needed, share a copy with personal details and
device identifiers removed; avoid publishing your original calibration.

Before preparing a code contribution, contact the maintainer to agree in writing
on permission to modify the code and on the rights needed to incorporate your
contribution. Bug reports and suggestions are welcome without a code contribution.
These instructions do not grant a general license to modify or redistribute the
editor or automatically transfer ownership of contributions.

## 📄 License

Copyright (c) 2023-2026 Vladi Ed. **All rights reserved.**

The maintainer's own project materials are covered by the
[proprietary license](LICENSE). The official website at https://audyssey.pages.dev may be used by individuals for personal,
non-commercial, non-professional purposes. Other use of the code or application,
including local builds, modification, redistribution, separate hosting, and
commercial or organizational use, requires prior written permission, subject to
the exceptions stated in LICENSE. These terms do not restrict users' own ADY
files or exported calibration data and chart images.

Viewing and forking a public repository within GitHub remain subject to
[GitHub's terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#5-license-grant-to-other-users).
Public visibility does not grant a general reuse license. For permission beyond
the official-site allowance, contact the maintainer through
[GitHub Issues](https://github.com/Vladi-ed/Audyssey-Editor/issues).

The Git history starts with a Vladi-authored initial commit (`9734833`) and
includes contributions from
[drumminj/Audyssey-Web-Editor](https://github.com/drumminj/Audyssey-Web-Editor).
The proprietary license applies only to materials for which the maintainer holds
the relevant rights; it does not relicense historical third-party contributions.

The identified fork contributions have been reviewed and the remaining chart
menu and target-point save implementations replaced. See
[the code provenance review](CODE-PROVENANCE.md) for commit-by-commit findings,
retained format/type definitions, and the limits of that review. Historical
commits remain in Git; this review is not a project-wide ownership guarantee.

Dependencies retain their own licenses. In particular,
[Highcharts has separate licensing terms](https://shop.highcharts.com/license-eula-1.0);
the editor license does not replace them. The production build copies LICENSE to
`dist/browser/LICENSE` and emits `dist/3rdpartylicenses.txt`; retain applicable
dependency notices when distributing a build.

ADY Web Editor is independent and is not affiliated with or endorsed by Audyssey Laboratories.
Audyssey and MultEQ are trademarks of Audyssey Laboratories, Inc.

## 👨‍💻 Author

**Vladi Ed** - Audio engineer and web developer
