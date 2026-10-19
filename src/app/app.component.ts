import { ChangeDetectorRef, Component, computed, inject, OnDestroy, viewChild } from '@angular/core';
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
import { prepareTargetCurvePointsForSave } from './helper-functions/target-curve-boundaries';
import { estimateTargetCutoffs } from './helper-functions/target-curve-cutoff';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatOption, MatRipple } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { ChannelSelectorComponent } from './channel-selector/channel-selector.component';
import { ChannelInfoComponent } from './channel-info/channel-info.component';
import { TargetCurvePointsComponent } from './target-curve-points/target-curve-points.component';
import { DOCUMENT } from '@angular/common';
import { DecodeEqTypePipe } from './helper-functions/decode-eq-type.pipe';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { version } from '../../package.json';
import { AdyFileLoader } from './helper-functions/ady-file-loader';
import { ExportSupportComponent } from './export-support/export-support.component';
import {
    getCorrectionChannels,
    getSharedSubwooferOutputs,
    isSubwoofer,
    resolveCorrectionChannel
} from './helper-functions/correction-channel';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    host: {
        '(dragover)': '$event.preventDefault()',
        '(drop)': 'onDragDrop($event)',
    },
    providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipOptions }],
    imports: [MatCard, MatCardContent, MatRipple, MatExpansionModule, MatFormField, MatLabel, MatInput, FormsModule, MatSelect, MatOption, MatCheckbox, ChannelSelectorComponent, ChannelInfoComponent, TargetCurvePointsComponent, MatCardHeader, HighchartsChartComponent, DecodeEqTypePipe, MatTooltip, ExportSupportComponent]
})
export class AppComponent implements OnDestroy {
    readonly appVersion = version;
    private channelInfo = viewChild(ChannelInfoComponent);
    private targetCurvePoints = viewChild(TargetCurvePointsComponent);
    hasInvalidEdits = computed(() => !!this.channelInfo()?.hasInvalidEdits()
        || !!this.targetCurvePoints()?.hasInvalidEdits());
    private chartObj?: Highcharts.Chart;
    private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);
    private document = inject(DOCUMENT);
    darkThemeEnabled = false;
    subwooferOverlayEnabled = false;
    showSupportPrompt = false;
    isSaving = false;

    chartOptions: Highcharts.Options = { series: seriesOptions };
    audysseyData: AudysseyInterface = { detectedChannels: [] };
    loadedFileName?: string;
    calculatedChannelsData?: Map<number, number[][]>
    private targetCurveCutoffs = new Map<number, number>();
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
            this.targetCurveCutoffs.clear();
            this.subwooferOverlayEnabled = false;
            this.updateChart();
            this.chartObj?.zoomOut();
        },
        processed: measurements => {
            this.calculatedChannelsData = measurements;
            this.targetCurveCutoffs = estimateTargetCutoffs(this.correctionChannels, measurements);
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

    isSubwoofer = isSubwoofer;

    get isLoading(): boolean {
        return this.fileLoader.isLoading;
    }

    // The correction owner can differ from the selected physical output.
    get selectedChannel(): DetectedChannel | undefined {
        return resolveCorrectionChannel(this.selectedChannelRaw, this.audysseyData.detectedChannels, this.audysseyData.subwooferMode);
    }

    private get selectedChannelCutoff(): number {
        return this.targetCurveCutoffs.get(this.selectedChannel?.enChannelType ?? -1) ?? 0;
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
        // Hide before Highcharts handles movement so its showDelay restarts.
        // const hideTooltip = () => chart.tooltip?.hide(0);
        // chart.container.addEventListener('mousemove', hideTooltip, true);
        // chart.container.addEventListener('mousedown', hideTooltip, true);
        let draggedPointX: number;
        // draggable point series
        chart.series[3].update({
            type: 'scatter',
            point: {
                events: {
                    dragStart: function () {
                        draggedPointX = this.x as number;
                    },
                    drag: (event) => {
                        const selectedChannel = this.selectedChannel;
                        const values = event.newPointId ? event.newPoints[event.newPointId]?.newValues : undefined;
                        const y = values?.['y'];
                        if (this.isLoading || !selectedChannel || typeof y !== 'number') return;
                        const baseline = getBaseCurveValue(draggedPointX,
                            this.audysseyData.enTargetCurveType, selectedChannel.midrangeCompensation, this.selectedChannelCutoff);
                        const points = selectedChannel.customTargetCurvePoints.map(point => {
                            const frequency = Number.parseFloat(point.substring(1));
                            return Math.abs(frequency - draggedPointX) < 0.01
                                ? `{${frequency}, ${Math.max(-12, Math.min(12, y - baseline))}}` : point;
                        });
                        // Highcharts redraws the moving handle and this preview together.
                        const preview = this.getTargetCurveData(prepareTargetCurvePointsForSave(points));
                        chart.series[2].setData(preview.line, false, false);
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
                            selectedChannel.midrangeCompensation,
                            this.selectedChannelCutoff
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

                        selectedChannel.customTargetCurvePoints = prepareTargetCurvePointsForSave(newCurvePoints);
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

        const [measurement, subwoofer, targetCurve, targetHandles] = this.chartObj.series;
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
            type: targetCurve.type === 'line' ? 'line' : 'spline',
            color: this.darkThemeEnabled ? '#9a5cff' : '#008000',
            lineWidth: this.darkThemeEnabled ? 2.4 : 2,
        }, false);
        targetHandles?.update({
            type: 'scatter',
            color: this.darkThemeEnabled ? '#9a5cff' : '#008000',
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
        const customCrossover = selectedChannel.customCrossover;
        const crossoverFrequency = customCrossover ? decodeCrossover(customCrossover) : this.selectedChannelCutoff;
        if (!this.isSubwoofer(selectedChannel) &&
            customCrossover !== 'F' &&
            customCrossover !== 'U' &&
            crossoverFrequency > 0 &&
            this.chartLogarithmicScale) {
            if (!customCrossover) console.log(`Auto crossover (${selectedChannelName}): ${crossoverFrequency} Hz`);
            xAxisBands.push({
                from: XMin,
                to: crossoverFrequency,
                color: 'rgba(160, 160, 160, 0.1)',
                label: {
                    text: customCrossover ? 'Crossover' : 'Auto crossover',
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
        const target = this.getTargetCurveData();
        this.chartOptions.series![2] = { type: target.type, data: target.line };
        this.chartOptions.series![3] = { type: 'scatter', data: target.handles };
        this.chartObj?.update(this.chartOptions, true);
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
        const target = this.getTargetCurveData();
        this.chartOptions.series![2] = { type: target.type, data: target.line };
        this.chartOptions.series![3] = { type: 'scatter', data: target.handles };
        const targetCurve = this.chartObj?.series[2];
        if (targetCurve && targetCurve.type !== target.type) {
            targetCurve.update({ type: target.type }, false);
        }
        this.chartObj?.series[2].setData(target.line, false, false);
        this.chartObj?.series[3].setData(target.handles, false, false);
        this.chartObj?.redraw(false);
    }

    private getTargetCurveData(customPoints?: string[]): {
        type: 'spline' | 'line';
        line: [number, number][];
        handles: Highcharts.PointOptionsObject[];
    } {
        const selectedChannel = this.selectedChannel;
        if (!selectedChannel) return { type: 'spline', line: [], handles: [] };

        // condition for Audyssey One modified files
        if (selectedChannel.customTargetCurvePoints && selectedChannel.customTargetCurvePoints.length > 1000) {
            return {
                type: 'line',
                line: selectedChannel.customTargetCurvePoints.map(point => {
                    const coordinates = point.replace(/[{}]/g, '').split(',');
                    return [Number.parseFloat(coordinates[0]), Number.parseFloat(coordinates[1])]
                }),
                handles: [],
            }
        }
        const points = calculateTargetCurve(
            this.audysseyData.enTargetCurveType,
            selectedChannel.midrangeCompensation,
            customPoints ?? selectedChannel.customTargetCurvePoints,
            selectedChannel.frequencyRangeRolloff,
            this.selectedChannelCutoff
        );
        return {
            type: 'spline',
            line: points.map(point => [Number(point.x), point.y!]),
            handles: points.filter(point => point.dragDrop?.draggableY),
        };
    }

    async exportFile() {
        if (this.isLoading || this.isSaving || !this.audysseyData.detectedChannels.length) return;
        if (this.hasInvalidEdits()) {
            this.snackBar.open('Fix invalid values before exporting.', 'Dismiss', { duration: 5000 });
            return;
        }
        this.isSaving = true;
        try {
            const saved = await exportFile(this.audysseyData, this.audysseyData.title, 'ady');
            if (!saved) return;
        } catch {
            this.snackBar.open('Could not save the file. Please try again.', 'Dismiss', { duration: 5000 });
            return;
        } finally {
            this.isSaving = false;
        }

        try {
            const key = 'ady-export-count';
            const count = Number(localStorage.getItem(key)) + 1;
            localStorage.setItem(key, String(count));
            if (count % 2 == 0) this.showSupportPrompt = true;
        } catch {
            // Export still works when browser storage is unavailable.
        }
    }

    dismissSupportPrompt() {
        this.showSupportPrompt = false;
    }

    loadExample() {
        return this.fileLoader.loadExample();
    }

    onDragDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        return this.onUpload(event.dataTransfer?.files ?? null);
    }
}
