import {Component} from '@angular/core';
import {AudysseyInterface} from './interfaces/audyssey-interface';
import {DetectedChannel} from './interfaces/detected-channel';
import {decodeChannelName} from './helper-functions/decode-channel-name.pipe';

import * as Highcharts from 'highcharts';
// import HC_boost from 'highcharts/modules/boost'
import Draggable from 'highcharts/modules/draggable-points';
// import Datagrouping from 'highcharts/modules/datagrouping';
import Exporting from 'highcharts/modules/exporting';
import {initOptions, seriesOptions} from './helper-functions/highcharts-options';
import {decodeCrossover} from "./helper-functions/decode-crossover";
import {exportFile} from "./helper-functions/export-file";
import {calculateTargetCurve} from "./helper-functions/calculate-target-curve";

// Datagrouping(Highcharts);
// HC_boost(Highcharts);
Draggable(Highcharts);
Exporting(Highcharts);
Highcharts.setOptions(initOptions);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly highcharts = Highcharts as any;
  chartOptions: Highcharts.Options = { series: seriesOptions };
  chartUpdateFlag = false;

  private chartObj?: Highcharts.Chart;

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

    // update target curve with draggable points
    let replacePoint: string;
    chart.series[2].update({
      type: 'spline',
      point: {
        events: {
          dragStart: function () {
            replacePoint = '{' + this.x;
          },
          drop: (a) => {
            // cannot just convert target curve to points because it contains midrange compensation and rolloff
            // const newPointsArr = chart.series[2].points.map(point => '{' + point.x + ', ' + point.y + '}');
            // this.selectedChannel!.customTargetCurvePoints = newPointsArr;
            // console.log('a.newPoint', a.newPoint, newPointsArr);

            const newCurvePoints: string[] = [];
            this.selectedChannel?.customTargetCurvePoints.forEach((point, i) => {
              if (point.startsWith(replacePoint)) {
                newCurvePoints[i] = point.replace(/, ?[-+]?\d*\.?\d+/g, ', '
                  // @ts-ignore
                  + a.newPoint.y.toFixed(1));
              }
              else newCurvePoints[i] = point;
            });

            this.selectedChannel!.customTargetCurvePoints = newCurvePoints;
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
      this.audysseyData = JSON.parse(fileContent);
      this.processDataWithWorker(this.audysseyData);
    }
    else alert('Cannot read the file');
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
    } else alert('Your browser is not supported. Please use latest Firefox or Chrome.');
  }

  updateChart() {
    // console.log('updateChart()')

    const XMin = 10, XMax = 24000;
    const xAxisBands = [];

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
    const selectedChannelData = this.calculatedChannelsData?.get(this.selectedChannel!.enChannelType) ?? [];

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

    // condition for Audessey One modified files
    if (this.selectedChannel?.customTargetCurvePoints && this.selectedChannel.customTargetCurvePoints.length > 1000) {
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
        this.selectedChannel?.midrangeCompensation,
        this.selectedChannel?.customTargetCurvePoints,
        this.selectedChannel?.frequencyRangeRolloff
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
    if (this.selectedChannel?.customCrossover) {
      if (this.selectedChannel.customCrossover === 'F')
        this.selectedChannel.customSpeakerType = 'L';
      else
        this.selectedChannel.customSpeakerType = 'S';
    }
    else this.selectedChannel!.customSpeakerType = undefined;

    this.updateChart();
  }

  updateSpeakerType() {
    if (this.selectedChannel?.customSpeakerType) {
      if (this.selectedChannel.customSpeakerType === 'L')
        this.selectedChannel.customCrossover = 'F'
      else
        this.selectedChannel.customCrossover = '80';
    }
    else this.selectedChannel!.customCrossover = undefined;

    this.updateChart();
  }
}
