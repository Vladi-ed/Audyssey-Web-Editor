import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { AudysseyInterface } from './interfaces/audyssey-interface';
import { DetectedChannel } from './interfaces/detected-channel';
import { decodeChannelName } from './helper-functions/decode-channel-name';

import type Highcharts from 'highcharts/esm/highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import { darkChartTheme, lightChartTheme, seriesOptions } from './helper-functions/highcharts-options';
import { tooltipOptions } from './helper-functions/material-options';
import { decodeCrossover } from './helper-functions/decode-crossover';
import { exportFile } from './helper-functions/export-file';
import { calculateTargetCurve, getBaseCurveValue } from './helper-functions/calculate-target-curve';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatOption, MatRipple } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { ChannelSelectorComponent } from './channel-selector/channel-selector.component';
import { TargetCurvePointsComponent } from './target-curve-points/target-curve-points.component';
import { DecimalPipe, DOCUMENT } from '@angular/common';
import { DecodeEqTypePipe } from './helper-functions/decode-eq-type.pipe';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { version } from '../../package.json';
import { AdyFileLoader } from './helper-functions/ady-file-loader';
import {
    getCorrectionChannels,
    getSharedSubwooferOutputs,
    resolveCorrectionChannel
} from './helper-functions/correction-channel';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    host: {
        '(dragover)': '$event.preventDefault()',
        '(drop)': 'onDragDrop($event)',
    },
    providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipOptions }],
    imports: [MatCard, MatCardContent, MatRipple, MatExpansionModule, MatFormField, MatLabel, MatInput, FormsModule, MatSelect, MatOption, MatCheckbox, ChannelSelectorComponent, TargetCurvePointsComponent, MatCardHeader, HighchartsChartComponent, DecimalPipe, DecodeEqTypePipe, MatTooltip, MatRadioButton, MatRadioGroup]
})
export class AppComponent implements OnDestroy {
    readonly appVersion = version;
    private chartObj?: Highcharts.Chart;
    private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);
    private document = inject(DOCUMENT);
    darkThemeEnabled = false;
    subwooferOverlayEnabled = false;

    chartOptions: Highcharts.Options = { series: seriesOptions };
    audysseyData: AudysseyInterface = { detectedChannels: [] };
    loadedFileName?: string;
    calculatedChannelsData?: Map<number, number[][]>
    selectedChannelRaw?: DetectedChannel;
    private chartLogarithmicScale = true;
    private graphSmoothEnabled = false;
    private selectionToRestore: number[] = [];
    private fileLoader = new AdyFileLoader({
        accepted: (data, filename) => {
            // Keep IDs while clearing old objects, including across overlapping loads.
            if (this.selectedChannelRaw) {
                this.selectionToRestore = [this.selectedChannelRaw.enChannelType];
                const selectedChannel = this.selectedChannel;
                if (selectedChannel && selectedChannel !== this.selectedChannelRaw) {
                    this.selectionToRestore.push(selectedChannel.enChannelType);
                }
            }
            this.audysseyData = data;
            this.loadedFileName = filename;
            this.selectedChannelRaw = undefined;
            this.calculatedChannelsData = undefined;
            this.subwooferOverlayEnabled = false;
            this.updateChart();
            this.chartObj?.zoomOut();
        },
        processed: measurements => {
            this.calculatedChannelsData = measurements;
            this.selectedChannelRaw = this.selectionToRestore
                .map(id => this.audysseyData.detectedChannels.find(channel => channel.enChannelType === id))
                .find(channel => channel !== undefined) ?? this.correctionChannels[0];
            this.updateChart();
        },
        loadingChanged: () => this.syncLoading(),
        error: (message, cause) => {
            this.snackBar.open(message, 'Dismiss', { duration: 5000 });
            if (cause) console.warn(cause);
        },
    });

    get isLoading(): boolean {
        return this.fileLoader.isLoading;
    }

    // The correction owner can differ from the selected physical output.
    get selectedChannel(): DetectedChannel | undefined {
        return resolveCorrectionChannel(this.selectedChannelRaw, this.audysseyData.detectedChannels, this.audysseyData.subwooferMode);
    }

    get correctionChannels(): DetectedChannel[] {
        return getCorrectionChannels(this.audysseyData.detectedChannels, this.audysseyData.subwooferMode);
    }

    get sharedSubwooferOutputs(): DetectedChannel[] {
        return getSharedSubwooferOutputs(this.selectedChannelRaw, this.audysseyData.detectedChannels, this.audysseyData.subwooferMode);
    }

    get sharedSubwooferOutputNames(): string {
        return this.sharedSubwooferOutputs.map(channel => `SW${channel.enChannelType - 53}`).join(', ');
    }

    get selectedOutputName(): string {
        if (!this.selectedChannelRaw) return '';
        return this.selectedChannelRaw.commandId;
    }

    correctionChannelName = (channel: DetectedChannel): string =>
        getSharedSubwooferOutputs(channel, this.audysseyData.detectedChannels, this.audysseyData.subwooferMode).length > 1
            ? 'Subwoofers' : decodeChannelName(channel.commandId, channel.enChannelType);

    get correctionCurveTooltip(): string {
        if (this.sharedSubwooferOutputs.length > 1) {
            return `${this.selectedOutputName} selected · Shared correction for ${this.sharedSubwooferOutputNames}`;
        }
        return this.selectedChannelRaw && !this.selectedChannel
            ? 'Shared subwoofer curve unavailable: the primary subwoofer entry is missing. Output settings remain editable.' : '';
    }

    selectCorrectionChannel(channel: DetectedChannel) {
        if (this.isLoading) return;
        if (this.selectedChannel !== channel) this.selectedChannelRaw = channel;
        this.updateChart();
    }

    selectSubwooferOutput(channel: DetectedChannel) {
        if (this.isLoading) return;
        if (!this.sharedSubwooferOutputs.includes(channel)) return;
        this.selectedChannelRaw = channel;
        this.updateChart();
    }

    isSubwoofer(channel: DetectedChannel): boolean {
        // All recovered ADY subwoofer indices: LFE, directional, mixed, and four-sub LFE.
        return channel.enChannelType >= 42 && channel.enChannelType <= 65;
    }

    // Updates context menu items for the chart based on the option's current state
    updateChartMenuItems() {
        this.chartObj?.update({
            exporting: {
                menuItemDefinitions: {
                    xScaleBtn: {
                        text: `Switch to ${this.chartLogarithmicScale ? 'Linear' : 'Logarithmic'} Scale`
                    },
                    graphSmoothingBtn: {
                        text: `${this.graphSmoothEnabled ? '✔️' : ''} Graph Smoothing`
                    },
                }
            }
        });
    }

    chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
        // console.log('Highcharts callback one time on graph init');
        let draggedPointX: number;
        chart.series[2].update({
            type: 'spline',
            point: {
                events: {
                    dragStart: function () {
                        draggedPointX = this.x as number;
                    },
                    drop: (event) => {
                        if (this.isLoading) return false;
                        const selectedChannel = this.selectedChannel;
                        if (!selectedChannel) return false;
                        const newValues = event.newPointId ? event.newPoints[event.newPointId]?.newValues : undefined;
                        const x = newValues?.['x'] ?? event.target.x;
                        const absY = newValues?.['y'] ?? event.target.y;
                        if (typeof x !== 'number' || typeof absY !== 'number') return false;

                        // ADY stores offsets relative to the base curve, not absolute graph values.
                        const baseVal = getBaseCurveValue(
                            x,
                            this.audysseyData.enTargetCurveType,
                            selectedChannel.midrangeCompensation
                        );

                        let newOffset = absY - baseVal;

                        // Clamp the offset to be within -12 and 12
                        if (newOffset > 12) newOffset = 12;
                        if (newOffset < -12) newOffset = -12;

                        const newCurvePoints: string[] = [];
                        selectedChannel.customTargetCurvePoints.forEach((point, i) => {
                            const coordinates = point.replace(/[{}]/g, '').split(',');
                            const pointFreq = Number.parseFloat(coordinates[0]);

                            // Compare frequency with a small epsilon to handle floating point precision differences
                            // e.g. "53.875591278076172" vs. 53.87559127807617
                            if (Math.abs(pointFreq - draggedPointX) < 0.01) {
                                // We construct the string as {Freq, Offset}
                                // Audyssey files expect the user points to be stored as offsets.
                                newCurvePoints[i] = `{${x}, ${newOffset.toFixed(2)}}`;
                            } else newCurvePoints[i] = point;
                        });

                        selectedChannel.customTargetCurvePoints = newCurvePoints;
                        this.cdr.markForCheck();

                        // Rebuild interpolation after Highcharts completes its default point drop.
                        setTimeout(() => this.updateTargetCurve(), 1);

                        // Allow the default drop; explicit return satisfies noImplicitReturns.
                        return undefined;
                    }
                }
            },
        });

        if (chart.options.exporting?.menuItemDefinitions) {
            const menuItems = chart.options.exporting.menuItemDefinitions as Record<string, Highcharts.ExportingMenuObject>;
            const scaleBtn = menuItems['xScaleBtn'];
            const graphSmoothingBtn = menuItems['graphSmoothingBtn'];

            scaleBtn.onclick = () => {
                this.chartLogarithmicScale = !this.chartLogarithmicScale;
                this.updateChart();
                chart.update({ xAxis: { type: this.chartLogarithmicScale ? 'logarithmic' : 'linear' } });
                this.updateChartMenuItems(); // updateChart() doesn't update menus
            }
            graphSmoothingBtn.onclick = () => {
                this.graphSmoothEnabled = !this.graphSmoothEnabled;
                chart.series[0].update({ type: this.graphSmoothEnabled ? 'spline' : 'line' });
                this.updateChartMenuItems();
            }
        }
        this.chartObj = chart;
        this.applyChartTheme();
        this.syncLoading();
    }

    toggleColorScheme() {
        this.darkThemeEnabled = !this.darkThemeEnabled;
        this.syncColorScheme();
    }

    private syncColorScheme() {
        this.document.documentElement.style.colorScheme = this.darkThemeEnabled ? 'dark' : 'light';
        this.document.body.classList.toggle('dark-theme', this.darkThemeEnabled);
        this.applyChartTheme();
        this.cdr.markForCheck();
    }

    private applyChartTheme() {
        if (!this.chartObj) return;

        this.chartObj.update(this.darkThemeEnabled ? darkChartTheme : lightChartTheme, false);

        const [measurement, subwoofer, targetCurve] = this.chartObj.series;
        measurement?.update((this.darkThemeEnabled ? {
            color: '#45d7ff',
            lineWidth: 2,
            zones: [],
        } : {
            color: '#719f20',
            lineWidth: 1,
            zones: [
                { value: -10, color: '#f79d5c' },
                { value: 5, color: '#719f20' },
                { value: 10, color: '#d98f52' },
                { value: 20, color: '#ff0000' },
                { color: '#c93737' },
            ],
        }) as Highcharts.SeriesOptionsType, false);
        subwoofer?.update({
            type: 'spline',
            color: this.darkThemeEnabled ? '#ffbd54' : '#000000',
            lineWidth: this.darkThemeEnabled ? 1.5 : 0.8,
        }, false);
        targetCurve?.update({
            type: 'spline',
            color: this.darkThemeEnabled ? '#9a5cff' : '#008000',
            lineWidth: this.darkThemeEnabled ? 2.4 : 2,
            marker: this.darkThemeEnabled ? {
                lineWidth: 1.5,
                lineColor: '#f3edff',
                fillColor: '#9a5cff',
                radius: 4,
                symbol: 'circle',
            } : {
                lineWidth: 0,
                lineColor: '#008000',
                fillColor: '#008000',
                radius: 4,
                symbol: 'circle',
            },
        }, false);

        this.chartObj.redraw();
    }

    async onUpload(files: FileList | null) {
        const file = files?.item(0);
        if (!file) return;
        const data = await this.fileLoader.loadFile(file);
        if (!data) return;

        fetch('/stats.api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: data.targetModelName, channels: data.detectedChannels.map(channel => channel.commandId) })
        }).catch(console.error);
    }

    private syncLoading() {
        if (this.isLoading) this.chartObj?.showLoading();
        else this.chartObj?.hideLoading();
        this.cdr.markForCheck();
    }

    ngOnDestroy() {
        this.fileLoader.destroy();
    }

    updateChart() {
        const selectedChannel = this.selectedChannel;

        if (!selectedChannel) {
            this.chartOptions.title = { text: 'Measurements graph' };
            this.chartOptions.xAxis = {
                min: 10,
                max: 24000,
                type: this.chartLogarithmicScale ? 'logarithmic' : 'linear',
                plotBands: []
            };
            this.chartOptions.series = this.chartOptions.series?.map(
                series => ({ ...series, data: [] })
            ) as Highcharts.SeriesOptionsType[];

            this.chartObj?.update(this.chartOptions, true);
            return;
        }

        const XMin = 10, XMax = 24000;
        const xAxisBands: Highcharts.XAxisPlotBandsOptions[] = [];
        const selectedChannelName = this.correctionChannelName(selectedChannel);

        this.chartOptions.title = { text: selectedChannelName };
        this.chartOptions.subtitle = { style: { color: 'white' } };

        // Add frequency rolloff only if it's less then 20kHz
        if (selectedChannel.frequencyRangeRolloff && selectedChannel.frequencyRangeRolloff < 20000) {
            xAxisBands.push({
                from: selectedChannel.frequencyRangeRolloff,
                to: XMax,
                color: 'rgba(68, 170, 213, 0.1)',
                label: {
                    text: 'Disabled',
                    style: { color: '#606060' }
                }
            });
        }

        // Add speaker crossover when using a logarithmic scale
        if (!this.isSubwoofer(selectedChannel) &&
            selectedChannel.customCrossover &&
            selectedChannel.customCrossover !== 'F' &&
            this.chartLogarithmicScale) {
            xAxisBands.push({
                from: XMin,
                to: decodeCrossover(selectedChannel.customCrossover),
                color: 'rgba(160, 160, 160, 0.1)',
                label: {
                    text: 'Crossover',
                    style: { color: '#606060' }
                }
            });
        }

        this.chartOptions.xAxis = {
            min: XMin,
            max: XMax,
            type: this.chartLogarithmicScale ? 'logarithmic' : 'linear',
            plotBands: xAxisBands
        };

        const selectedChannelData = this.calculatedChannelsData?.get(selectedChannel.enChannelType) ?? [];

        const measurement = 0;
        this.chartOptions.series![measurement] = {
            data: [...selectedChannelData],
            type: this.graphSmoothEnabled ? 'spline' : 'line',
            name: selectedChannelName
        };

        this.updateSubwooferSeries(selectedChannel);
        this.updateTargetCurve();
    }

    addSubwooferToTheGraph(checked: boolean) {
        const selectedChannel = this.selectedChannel;
        if (!selectedChannel) return;

        this.subwooferOverlayEnabled = checked;
        this.updateSubwooferSeries(selectedChannel);
        this.chartObj?.update(this.chartOptions, true);
    }

    private updateSubwooferSeries(selectedChannel: DetectedChannel) {
        const subCutOff = Number.parseInt('200 Hz') / 3;
        const subDataPoints = this.calculatedChannelsData?.get(54) || this.calculatedChannelsData?.get(42);
        const subwoofer = 1; // series number
        const showOverlay = this.subwooferOverlayEnabled && !this.isSubwoofer(selectedChannel);

        this.chartOptions.series![subwoofer] = {
            data: showOverlay ? (subDataPoints?.slice(0, subCutOff) ?? []) : [],
            type: 'spline',
            name: 'Subwoofer',
        };
    }

    updateTargetCurve() {
        const targetCurve = 2;
        const selectedChannel = this.selectedChannel;

        if (!selectedChannel) {
            // no selected channel, clear target curve
            this.chartOptions.series![targetCurve] = { data: [], type: 'spline' };

            this.chartObj?.update(this.chartOptions, true);
            return;
        }

        // condition for Audyssey One modified files
        if (selectedChannel.customTargetCurvePoints && selectedChannel.customTargetCurvePoints.length > 1000) {
            this.chartOptions.series![targetCurve] = {
                data: selectedChannel.customTargetCurvePoints.map(point => {
                    const coordinates = point.replace(/[{}]/g, '').split(',');
                    return [Number.parseFloat(coordinates[0]), Number.parseFloat(coordinates[1])]
                }),
                type: 'line'
            }
        }
        else this.chartOptions.series![targetCurve] = {
            data: calculateTargetCurve(
                this.audysseyData.enTargetCurveType,
                selectedChannel.midrangeCompensation,
                selectedChannel.customTargetCurvePoints,
                selectedChannel.frequencyRangeRolloff
            ),
            type: 'spline',
        };

        this.chartObj?.update(this.chartOptions, true);
    }

    exportFile() {
        if (this.isLoading || !this.audysseyData.detectedChannels.length) return;
        exportFile(this.audysseyData, this.audysseyData.title, 'ady');
    }

    loadExample() {
        return this.fileLoader.loadExample();
    }

    updateCrossover() {
        if (this.isLoading || !this.selectedChannelRaw) return;

        if (this.selectedChannelRaw.customCrossover) {
            if (this.selectedChannelRaw.customCrossover === 'F')
                this.selectedChannelRaw.customSpeakerType = 'L';
            else
                this.selectedChannelRaw.customSpeakerType = 'S';
        }
        else this.selectedChannelRaw.customSpeakerType = undefined;

        this.updateChart();
    }

    updateSpeakerType() {
        if (this.isLoading || !this.selectedChannelRaw) return;

        if (this.selectedChannelRaw.customSpeakerType) {
            if (this.selectedChannelRaw.customSpeakerType === 'L')
                this.selectedChannelRaw.customCrossover = 'F'
            else
                this.selectedChannelRaw.customCrossover = '80';
        }
        else this.selectedChannelRaw.customCrossover = undefined;

        this.updateChart();
    }

    protected onDragDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
}
