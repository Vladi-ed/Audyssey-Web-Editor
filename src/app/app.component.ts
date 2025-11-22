import { Component, inject } from "@angular/core";
import {AudysseyInterface} from './interfaces/audyssey-interface';
import {DetectedChannel} from './interfaces/detected-channel';
import { decodeChannelName, DecodeChannelNamePipe } from './helper-functions/decode-channel-name.pipe';

import Highcharts from 'highcharts/esm/highcharts';
import 'highcharts/esm/modules/draggable-points';
// import 'highcharts/modules/boost'
// import 'highcharts/modules/datagrouping';
import 'highcharts/esm/modules/exporting';
import { HighchartsChartModule } from 'highcharts-angular';
import { initOptions, seriesOptions } from "./helper-functions/highcharts-options";
import { tooltipOptions } from "./helper-functions/material-options";
import { decodeCrossover } from "./helper-functions/decode-crossover";
import { exportFile } from "./helper-functions/export-file";
import { calculateTargetCurve, getBaseCurveValue } from "./helper-functions/calculate-target-curve";
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatRipple, MatOption } from '@angular/material/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { ChannelSelectorComponent } from './channel-selector/channel-selector.component';
import { TargetCurvePointsComponent } from './target-curve-points/target-curve-points.component';
import { DecimalPipe } from '@angular/common';
import { DecodeEqTypePipe } from './helper-functions/decode-eq-type.pipe';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { version } from '../../package.json';
import { validateAdy } from "./helper-functions/validate-ady";

Highcharts.setOptions(initOptions);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipOptions }],
    imports: [MatCard, MatCardContent, MatRipple, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatFormField, MatLabel, MatInput, FormsModule, MatSelect, MatOption, MatCheckbox, ChannelSelectorComponent, MatExpansionPanelDescription, MatExpansionPanelContent, TargetCurvePointsComponent, MatCardHeader, HighchartsChartModule, DecimalPipe, DecodeChannelNamePipe, DecodeEqTypePipe, MatTooltip]
})
export class AppComponent {
  readonly highcharts = Highcharts as any;
  readonly appVersion = version;
  chartOptions: Highcharts.Options = { series: seriesOptions };
  chartUpdateFlag = false;

  private chartObj?: Highcharts.Chart;
  private snackBar = inject(MatSnackBar);

  audysseyData: AudysseyInterface = { detectedChannels: [] };
  calculatedChannelsData?: Map<number, number[][]>

  selectedChannel?: DetectedChannel;
  chartLogarithmicScale = true;
  graphSmoothEnabled = false;

  // Updates context menu items for the chart based on the option's current state
  updateChartMenuItems() {
    this.chartObj?.update({
      exporting: {
        menuItemDefinitions: {
          xScaleBtn: {
            text: `Switch to ${this.chartLogarithmicScale ? "Linear" : "Logarithmic"} Scale`
          },
          graphSmoothingBtn: {
            text: `${this.graphSmoothEnabled ? "✔️" : ""} Graph Smoothing`
          },
        }
      }
    });
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    // console.log('Highcharts callback one time on graph init');

    // update the target curve with draggable points
    let replacePoint: string;
    chart.series[2].update({
      type: 'spline',
      point: {
        events: {
          dragStart: function () {
            replacePoint = '{' + this.x;
          },
          drop: (a) => {
            // Calculate the relative offset for the new position
            // We dragged the point to an Absolute Y. We need to find what the Base Curve Y is at this X.
            // @ts-ignore
            const x = a.newPoint.x ?? (a.target as any).x; // handle both drag/drop event structures just in case
            // @ts-ignore
            const absY = a.newPoint.y ?? (a.target as any).y;

            // Get base value
            const baseVal = getBaseCurveValue(
              x,
              this.audysseyData.enTargetCurveType,
              this.selectedChannel?.midrangeCompensation
            );

            // Offset = Absolute - Base
            const newOffset = absY - baseVal;

            const newCurvePoints: string[] = [];
            this.selectedChannel?.customTargetCurvePoints.forEach((point, i) => {
              if (point.startsWith(replacePoint)) {
                // We construct the string as {Freq, Offset}
                // Audyssey files expect the user points to be stored as offsets.
                newCurvePoints[i] = `{${x}, ${newOffset.toFixed(2)}}`;
              }
              else newCurvePoints[i] = point;
            });

            if (this.selectedChannel) {
              this.selectedChannel.customTargetCurvePoints = newCurvePoints;

              // Force chart update to redraw the curve with new interpolation
              // We need to defer this slightly or call updateTargetCurve directly because
              // Highcharts' default drag behavior only moves the single point,
              // but our "Adjustment Layer" logic means the whole line shape between points might change.
              setTimeout(() => this.updateTargetCurve(), 0);
            }

            // returning false prevents Highcharts from applying the default simple drag (which might be wrong while we recalculate)
            // actually, letting it drop visually is fine, the updateTargetCurve() will snap it to the correct interpolated shape immediately.
          }
        }
      },
    });

    if (chart.options.exporting?.menuItemDefinitions)
    {
      const scaleBtn = chart.options.exporting.menuItemDefinitions['xScaleBtn'];
      const graphSmoothingBtn = chart.options.exporting.menuItemDefinitions['graphSmoothingBtn'];

      scaleBtn.onclick = () => {
        this.chartLogarithmicScale = !this.chartLogarithmicScale;
        chart.update({ xAxis: { type: this.chartLogarithmicScale ? "logarithmic" : "linear" }});
        this.updateChartMenuItems(); // updateChart() doesn't update menus
      }
      graphSmoothingBtn.onclick = () => {
        this.graphSmoothEnabled = !this.graphSmoothEnabled;
        chart.series[0].update({type: this.graphSmoothEnabled ? 'spline' : 'line'});
        this.updateChartMenuItems();
      }
    }
    this.chartObj = chart;
  }

  async onUpload(files: FileList | null) {

    const fileContent = await files?.item(0)?.text();
    if (fileContent) {
      this.chartObj?.showLoading();
      try {
        this.audysseyData = JSON.parse(fileContent);
      } catch (e) {
        this.chartObj?.hideLoading();
        this.snackBar.open('Invalid file format. Expecting .ady file JSON format.', 'Dismiss');
        return;
      }

      const validationError = validateAdy(this.audysseyData);
      if (validationError) {
        this.chartObj?.hideLoading();
        this.snackBar.open(validationError, 'Dismiss');
        return;
      }

      this.processDataWithWorker(this.audysseyData);
    }
    else {
      this.chartObj?.hideLoading();
      this.snackBar.open('Cannot read the file.', 'Dismiss');
    }
  }

  processDataWithWorker(json: AudysseyInterface) {
    console.log('File content:', json);

    if (typeof Worker !== 'undefined') { // if supported
      const worker = new Worker(new URL('./helper-functions/bg-calculator.worker', import.meta.url));
      worker.postMessage(json.detectedChannels);
      console.log('detectedChannels', json.detectedChannels.map(channel => ({id: channel.enChannelType, name: channel.commandId})));

      worker.onmessage = ({ data }) => {
        // console.log('Got a message from Web-Worker');
        this.calculatedChannelsData = data;

        this.selectedChannel = json.detectedChannels[0];
        this.updateChart();
        this.chartObj?.hideLoading();
      };

      worker.onerror = (e) => {
        console.error('Worker error', e);
        this.chartObj?.hideLoading();
        this.snackBar.open('Background processing error.', 'Dismiss', { duration: 5000 });
      };
    } else {
      this.snackBar.open('Your browser is not supported. Please use latest Firefox or Chrome.', 'Ok');
    }
  }

  updateChart() {
    // console.log('updateChart()')

    if (!this.selectedChannel) {
      // Clear key series to avoid stale chart when no selection
      // this.chartOptions.series = this.chartOptions.series || [];
      // this.chartOptions.series[0] = { data: [], type: this.graphSmoothEnabled ? 'spline' : 'line', name: '' };
      // this.chartOptions.series[2] = { data: [], type: 'spline' };
      // this.chartUpdateFlag = true;
      return; // Guard when no channel is selected
    }

    const XMin = 10, XMax = 24000;
    const xAxisBands = [] as any[];

    this.chartOptions.title = { text: decodeChannelName(this.selectedChannel?.commandId) };
    this.chartOptions.subtitle = { style: {color: 'white'} };

    // add frequency Rolloff
    if (this.selectedChannel?.frequencyRangeRolloff && this.selectedChannel.frequencyRangeRolloff < 20000 ) {
      xAxisBands.push({
        from: this.selectedChannel.frequencyRangeRolloff,
        to: XMax,
        color: 'rgba(68, 170, 213, 0.1)',
        label: {
          text: 'Disabled',
          style: {color: '#606060'}
        }
      });
    }

    // add Crossover if it's a logarithmic scale
    if (this.selectedChannel?.customCrossover && this.selectedChannel.customCrossover != 'F' && this.chartLogarithmicScale) {
      xAxisBands.push({
        from: XMin,
        to: decodeCrossover(this.selectedChannel.customCrossover),
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

    // const selectedChannelData = calculatePoints(this.selectedChannel?.responseData[0], this.dataSmoothEnabled);
    const selectedChannelData = this.calculatedChannelsData?.get(this.selectedChannel.enChannelType) ?? [];

    // adding first graph
    const measurement = 0;
    this.chartOptions.series![measurement] = {
      data: [...selectedChannelData],
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      name: decodeChannelName(this.selectedChannel?.commandId),
    };

    this.updateTargetCurve();
  }

  addSubwooferToTheGraph(checked: boolean) {
    const subCutOff = parseInt('200 Hz') / 3;
    const subDataPoints = this.calculatedChannelsData?.get(54) || this.calculatedChannelsData?.get(42);
    const subwoofer = 1;

    // if (value) this.chartObj?.addSeries({});
    // else this.chartObj?.series.at(-1).destroy();

    if (checked) this.chartOptions.series![subwoofer] = {
      data: subDataPoints?.slice(0, subCutOff),
      type: 'spline',
      name: 'Subwoofer',
    };
    else this.chartOptions.series![subwoofer] = {
      data: [],
      type: 'spline',
    }

    this.chartUpdateFlag = true;
  }

  updateTargetCurve() {
    const targetCurve = 2;

    if (!this.selectedChannel) {
      // no selected channel, clear target curve
      this.chartOptions.series![targetCurve] = { data: [], type: 'spline' };
      this.chartUpdateFlag = true;
      return;
    }

    // condition for Audyssey One modified files
    if (this.selectedChannel.customTargetCurvePoints && this.selectedChannel.customTargetCurvePoints.length > 1000) {
      this.chartOptions.series![targetCurve] = {
        data: this.selectedChannel.customTargetCurvePoints.map(point => {
          const coordinates = point.replace(/[{}]/g, '').split(',');
          return [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        }),
        type: 'line'
      }
    }
    else this.chartOptions.series![targetCurve] = {
      data: calculateTargetCurve(
        this.audysseyData.enTargetCurveType,
        this.selectedChannel.midrangeCompensation,
        this.selectedChannel.customTargetCurvePoints,
        this.selectedChannel.frequencyRangeRolloff
      ),
      type: 'spline',
    };

    this.chartUpdateFlag = true;
  }

  exportFile() {
    exportFile(this.audysseyData, this.audysseyData.title, 'ady');
  }

  async loadExample() {
    this.chartObj?.showLoading();
    this.audysseyData.targetModelName = 'Loading...';
    const example = await fetch('assets/example-2-subs.ady').then(file => file.json());
    this.audysseyData = example;
    this.processDataWithWorker(example);
  }

  updateCrossover() {
    if (!this.selectedChannel) return;

    if (this.selectedChannel.customCrossover) {
      if (this.selectedChannel.customCrossover === 'F')
        this.selectedChannel.customSpeakerType = 'L';
      else
        this.selectedChannel.customSpeakerType = 'S';
    }
    else this.selectedChannel.customSpeakerType = undefined;

    this.updateChart();
  }

  updateSpeakerType() {
    if (!this.selectedChannel) return;

    if (this.selectedChannel.customSpeakerType) {
      if (this.selectedChannel.customSpeakerType === 'L')
        this.selectedChannel.customCrossover = 'F'
      else
        this.selectedChannel.customCrossover = '80';
    }
    else this.selectedChannel.customCrossover = undefined;

    this.updateChart();
  }
}
