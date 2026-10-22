# Changelog

## 0.9.6 — 2026-10-20

- Remember the selected light or dark theme across page reloads.
- Preserve graph theme colors when loading files or examples, switching channels, and updating curves.
- Add info icons with tooltips to enhance form fields in channel settings
- Remove trim adjustment logic and simplify channel settings form
- Added What's new dialog with release highlights. It opens after a version change, remembers dismissal in browser storage, and can be reopened using the header version button.
- Added this detailed historical changelog and documented how to maintain release notes.
- Updated mobile and tablet layouts for better usability.

## 0.9.5 — 2026-10-19

- Removed remaining trim adjustment logic and references throughout the editor. (`b59ec70`)
- Removed the obsolete trim adjustment control and simplified the channel settings form. (`d533491`)
- Added info icons and explanatory tooltips to channel settings fields. (`e134490`)
- Show Auto crossover shading and a label on the graph when no custom crossover is selected; custom crossovers take precedence. (`7dba4f8`)
- Estimate speaker cutoff from the first measurement and include low-frequency rolloff in the displayed target curve. (`d72f1fa`)
- Added drag-and-drop ADY file imports, using the same validation and background processing as the file picker. (`db6beed`)

## 0.9.4 — 2026-10-19

- Constrain dragged target curve points to supported frequency and gain boundaries. (`5230486`)

## 0.9.3 — 2026-10-18

- adding client hints parsing and modularizing logic (`f220db0`)
- modularize target curve boundary logic, enhance device detection (`6b4a81d`)
- simplify target curve logic, enhance drag handling (`2b4a237`)

## 0.9.2 — 2026-10-17

- remove unused helper functions and outdated comments (`f9e35ca`)
- optimize target curve update logic and streamline data binding (`aecb70f`)
- Added a save-file picker for ADY exports in supported browsers, with download fallback. (`133ab48`)

## 0.9.1 — 2026-10-12

- Added an optional contribution prompt after repeated exports. (`b34fd64`)
- Improved curve validation, export error handling, and accessible form feedback for invalid edits. (`d440540`)
- separate channel settings component, enhance input validation, and streamline UI (`266918d`)

## 0.9.0 — 2026-10-06

- hide empty subwoofer graphs, decouple channel name decoding, enhance correction channel handling, and update UI components (`f6ab8b6`)

## 0.8.4 — 2026-10-02

- updated favicon (`fa4d885`)
- obsolete guidelines and detailed channel type names (`ba4cdff`)
- add support for "Directional" and "N/A" values in subwooferMode (`62f01c6`)
- enhance worker communication and improve chart updates (`fbe42c9`)

## 0.8.3 — 2026-10-02

- Dependency, maintenance, or version metadata updates.

## 0.8.2 — 2026-10-01

- Keep subwoofer overlay state in sync with the graph (`4f270ea`)
- added new channel names (`2c88144`)
- enhance request classification and analytics logging (`053113b`)
- added new channel names (`98443a0`)

## 0.9.0 (temporary version) — 2026-10-01

- link preview control and improved location URL (`e2c85c8`)
- enhance API with type safety (`3fcfd27`)

## 0.8.1 — 2026-08-13

- remove unused stats API endpoints (`062e647`)
- Import channel name mapping and format arrays with newlines (`ce3cde3`)
- Remove KV storage, keep only Telegram notifications (`a920efb`)
- Integrate Telegram notifications with stats API (`51a7e47`)
- simplify channel selector component by removing unused imports and methods (`2b6d038`)

## 0.8.0 — 2026-08-11

- new dark theme (`6cf52ac`)
- new preview images (`0578713`)
- reduce initial loading time (`a58bf0d`)
- rebranding the project (`6df362f`)

## 0.7.0 — 2026-08-04

- updated tooltips (`c352595`)
- fixed api to handle pagination (`0924540`)
- added api to get stats (`0fbc370`)
- update to Highcharts v13, adjust options for compatibility and theme alignment (`61d7b64`)
- convert to zoneless change detection (`8a112cb`)

## 0.6.5 — 2026-04-12

- ng update @angular/material (`6fe394f`)
- ng update @angular/cli @angular/core (`146191f`)
- npm update fix (`005a92a`)

## 0.6.4 — 2026-02-08

- npm update, fixed 20 vulnerabilities (1 low, 7 moderate, 12 high) (`1a3fa66`)
- remove unused @angular/animations (`be99379`)
- Update stats API (`e535eb4`)
- added `SW3` channel mapping (`1374a35`)
- Fixed Channel Selection behavior by changing the chart update logic (`cad0ea4`)

## 0.6.3 — 2026-02-04

- Update dependencies, add stats API, improve file parsing (`019b482`)

## 0.6.2 — 2026-01-29

- ng update @angular/cli @angular/core (`6573d06`)

## 0.6.1 — 2025-11-26

- updated TypeScript configuration files: adjusted paths, compiler options, and testing setup (`f0de438`)

## 0.6.0 — 2025-11-24

- added global error listeners to improve error handling in main bootstrap logic (`4fe8a22`)
- Removed legacy configuration files and GitHub issue templates. (`085590e`)
- Fixed the offset to be within -12 and +12 (`451cbca`)
- updated .editorconfig and angular.json: adjusted indent sizes, removed unused schematics, added npm as default package manager, updated file size limits and minor cleanups (`57eabda`)
- fixed Enter button when changing custom points (`ff57beb`)
- Added groundwork for drag-and-drop event handling and updated checkbox colors. File uploads through dropping were implemented in 0.9.5. (`e136d29`)

## 0.5.5 — 2025-09-18

- added cure points remove animation (`5ea83cd`)
- added Front Dolby Right description (`12284f5`)
- migrated to highcharts-angular v5, (`3c0c6f0`)
- fixed the bug if the user has explicitly set a non-zero offset for 20 Hz, the 20000 Hz point becomes overridden by it. (`2356028`)
- new target curve working! (`502fde6`)
- updated material and typescript (`3f7f7b6`)
- updated angular (`f6dea31`)
- updated README.md (`54618bf`)

## 0.5.4 — 2025-09-02

- migrated/updated material styles, updated README.md (`1e3d4b2`)
- Fixed Vertical position for MatSnackBar (`3888327`)

## 0.5.3 — 2025-08-19

- ng update @angular/material (`32b808f`)

## 0.5.2 — 2025-08-19

- added ai framework guidelines (`a337139`)
- updated to Angular 19 and typescript 5.8 (`697b085`)

## 0.5.1 — 2025-08-19

- Update Angular 19
- Changing the provider for MatSnackBar to inject it directly (`4809603`)

## 0.5.0 — 2025-08-18

- added speaker distance inches tooltip, setup global tooltip config (`4742ddc`)
- added ady file error handler (`42b6dd4`)
- added file parsing error handler (`dd4d95a`)
- added version number (`a15fedb`)
- Add tooltips for better usability, Audyssey LFC option, adjust graph popup border style (`b74f872`)

## 0.4.5 — 2025-08-06

- Update dependencies in package-lock.json to fix the build (`8f6905e`)
- Add 'Surround Back Right' channel mapping (`90f79d5`)

## 0.4.4 — 2025-07-27

- Dependency, maintenance, or version metadata updates.

## 0.4.3 — 2025-07-27

- Dependency, maintenance, or version metadata updates.

## 0.4.2 — 2025-07-27

- Dependency, maintenance, or version metadata updates.

## 0.4.1 — 2024-10-31

- Dependency, maintenance, or version metadata updates.

## 0.4.0 — 2024-09-09

- fixed A1 support (`b6ad4d2`)
- refactoring after angular update (`d97f1d7`)

## 0.3.10 — 2024-09-03

- angular upgrade (`a9cbd27`)
- added new channel names, updated CEO (`456674c`)
- fixed a Front-left channel selecting bug (`e2641e8`)

## 0.3.9 — 2024-07-25

- Added Rear Height channels, fixed subwoofer mix channel exception, updated libraries (`09b2e13`)

## 0.3.8 — 2024-04-12

- Speedup data calculation with new FFT library (`d83e121`)

## 0.3.7 — 2024-03-26

- Speedup data calculation with new FFT library (`fc410ff`)
- Fixed A1 custom points saving and faster scrolling (`1665e87`)
- Fixed chartLogarithmicScale when changing chart scale (`6c0772e`)
- Support editing thousands of target curve points (without data validation) (`9cb6a19`)

## 0.3.6 — 2024-03-21

- reduced size of example-2-subs.ady (`784acb0`)
- updated target curve point styles and optimized sorting (`67df75c`)
- Support for Audyssey One ady file (`0677867`)

## 0.3.5 — 2024-02-22

- Check if there are more than 100 custom target points (`765ed6b`)
- implemented new ngFor syntax (`9f0aad6`)
- angular material upgrade (`240a355`)
- angular upgrade (`83f30a5`)
- fixed trimAdjustment string validation (`7144bbc`)
- updated customCrossover and speaker type selection logic (validate crossover values with speaker size) (`176d339`)

## 0.3.4 — 2024-02-17

- updated target points validation (`c5448df`)
- added draggable points (Y-axis) to the target curve!, stricter target points validation (`b64d4d0`)

## 0.3.3 — 2024-02-07

- Updated tooltip style, fixed mobile styles, refactoring (`0cf59ed`)
- Optimized graph calculation algorithm, added support for 2 joined subwoofers, removed target curse after the FreqLimit, and added channel dropdown selector on the graph title (`871251c`)

## 0.3.2 — 2024-01-29

- Refactoring from @drumminj fork (`24e83b0`)
- update custom points creation behaviour and input keyboard on mobile, tested data grouping, trim frequencies < 10Hz, reverted console.log (`5aca04f`)
- disable graph gpu acceleration, mobile version style fixes (`f5c6b16`)

## 0.3.1 — 2024-01-27

- Fixed custom crossover values, fixed button color on iOS, added copy-paste points, testing iOS export (`d38a0dc`)
- Alternate validation fix for target curve control points (`de56f39`)
- Sort target curve points by frequency to avoid weird artifacts when importing back into D&Ms editor (`07db2da`)
- Fix exception when toggling linear/log scale (and other chart options) when no ADY file is loaded (`17d665b`)
- reduced amount of drawing points 8 times, fixed target-curve type, updated math.js (`02692eb`)

## 0.3.0 — 2024-01-19

- data validation adjustment and fix typo (`fd7cc48`)
- replaced Donate button, updated README.md (`c0e48d3`)
- updated meta tags (`b9bcbfd`)
- updated meta tags (`278ca70`)
- added meta tags and preview, fixed popup dB (`fe99852`)
- add TargetCurvePoints data validation (20-20000), Add reference curve, bugfix when loading multiple files, mobile version optimization (`6806a93`)

## 0.2.0 — 2023-12-19

- Added an example (`ad117a6`)
- Updated interface, mobile view support, donate button, telegram support (`ce91932`)

## 0.1.0 — 2023-12-13

- Updated design (`c428aa0`)

## 0.0.0 — 2023-04-05

- updated README.md (`2942bb3`)
- ng update (`4538fc4`)
- fixed Custom Distance validation fixed HF Rolloff (`4351d12`)
- added Graph loading (data processing) indicator, (`368cc67`)
- fixed customTargetCurvePoints regex and maxlength, added matRipple to removePoint button added preloading template, renamed to Audyssey Editor, increased graph export resolution, added font preloading size adjustment (`a2ef086`)
- fixed customTargetCurvePoints exception, when no channel selected, hide Save button when nothing was changed (`3760575`)
- found out the 'step' in the graph, form fields validation (partially working), interface refactoring, added points animation (`8a5a34c`)
- removed calculations from app.component.ts, (`2f9de6d`)
- Update target curve points is working now (`fd5c586`)
- added sonification to the graph (no setup yet), added web-worker for calculations, added exporting and sonification modules to the graph (not enabled), refactoring, small ui changes (`245bc5b`)
- Added Export button, migrated to esbuild, added sonification to the graph (no setup yet), (`c368ad5`)
- disabled angular change detection on scroll and mouse move, updated angular material
- angular update (`15bead1`)
- moved initial graph option into a separated file, fixed subwoofer graph (made it switchable), fixed custom crossover values (`62cc6cc`)
- moved graph calculations to a separate function, added option to add subwoofer to the graph (`45fa91f`)
- added Highcharts Module with smoothing (`83abc97`)
- 1st commit (`b73dfc8`)
- initial commit (`9734833`)

