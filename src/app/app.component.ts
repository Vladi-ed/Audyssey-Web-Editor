import {Component} from '@angular/core';
import {AudysseyInterface} from './interfaces/audyssey-interface';
import {DetectedChannel} from './interfaces/detected-channel';
import {decodeChannelName} from './helper-functions/decode-channel-name.pipe';

import * as Highcharts from 'highcharts';
// import HC_boost from 'highcharts/modules/boost'
// import Draggable from 'highcharts/modules/draggable-points';
// import Datagrouping from 'highcharts/modules/datagrouping';
import Exporting from 'highcharts/modules/exporting';
import {options, seriesOptions} from './helper-functions/highcharts-options';
import {decodeCrossover} from "./helper-functions/decode-crossover";
import {convertToDraggablePoints, convertToNonDraggablePoints} from "./helper-functions/convert-draggable-points";

// Draggable(Highcharts);
// HC_boost(Highcharts);
Exporting(Highcharts);
// Datagrouping(Highcharts);
Highcharts.setOptions(options);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = { series: seriesOptions };
  chartUpdateFlag = false;

  private chartObj?: Highcharts.Chart;

  audysseyData: AudysseyInterface = { detectedChannels: [] };
  calculatedChannelsData?: Map<string, number[][]>

  selectedChannel?: DetectedChannel;
  chartLogarithmicScale = true;
  // dataSmoothEnabled = true;
  graphSmoothEnabled = false;

  // Updates context menu items for the chart based on the option's current state
  updateChartMenuItems() {
    this.chartObj?.update({
      exporting: {
        menuItemDefinitions: {
          xScale: {
            text: `Switch to ${this.chartLogarithmicScale ? "Linear" : "Logarithmic"} Scale`
          },
          graphSmoothing: {
            text: `${this.graphSmoothEnabled ? "✔️" : ""} Graph Smoothing`
          },
          // dataSmoothing: {
          //   text: `${this.dataSmoothEnabled ? "\u2713 " : "&nbsp;&nbsp;"} Data Smoothing`
          // }
        }
      }
    });
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    console.log('Highcharts callback one time on graph init');
    if (chart.options.exporting?.menuItemDefinitions)
    {
      const scaleBtn = chart.options.exporting.menuItemDefinitions['xScale'];
      const graphSmoothingBtn = chart.options.exporting.menuItemDefinitions['graphSmoothing'];

      scaleBtn.onclick = () => {
        this.chartLogarithmicScale = !this.chartLogarithmicScale;
        this.updateChart();
        this.updateChartMenuItems(); // updateChart() doesn't update menus
      }
      graphSmoothingBtn.onclick = () => {
        this.graphSmoothEnabled = !this.graphSmoothEnabled;
        this.updateChart();
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

      worker.onmessage = ({ data }) => {
        console.log('Got a message from Web-Worker');
        this.calculatedChannelsData = data;

        this.selectedChannel = json.detectedChannels[0];
        this.updateChart();
        this.chartObj?.hideLoading();
      };
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      alert('Your browser is not supported. Please use latest Firefox or Chrome browser.');
    }
  }

  updateChart() {
    console.log('updateChart()')

    const XMin = 10, XMax = 24000;

    this.chartOptions.title = {
      text: decodeChannelName(this.selectedChannel?.commandId)
    };

    // add frequency Rolloff
    const xAxisBands = [{
      from: this.selectedChannel?.frequencyRangeRolloff,
      to: XMax,
      color: 'rgba(68, 170, 213, 0.1)',
      label: {
        text: 'Disabled',
        style: { color: '#606060' }
      }
    }];

    // add Crossover if it's a logarithmic scale
    if (this.selectedChannel?.customCrossover && this.chartLogarithmicScale) {
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
      type: this.chartLogarithmicScale ? "logarithmic" : "linear",
      plotBands: xAxisBands
    };

    // const selectedChannelData = calculatePoints(this.selectedChannel?.responseData[0], this.dataSmoothEnabled);
    const selectedChannelData = this.calculatedChannelsData?.get(this.selectedChannel!.commandId);

    // adding first graph
    this.chartOptions.series![0] = {
      data: selectedChannelData ?? [],
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      name: decodeChannelName(this.selectedChannel?.commandId),
    };

    this.updateTargetCurve();
    // this.updateTargetCurve2();
  }

  addSubwooferToTheGraph(checked: boolean) {
    // const subDataValues = this.audysseyData.detectedChannels.at(-1)?.responseData[0] || [];
    // const subDataPoints = calculatePoints(subDataValues, false).slice(0, 62);
    // const customCrossover = this.selectedChannel?.customCrossover;
    // const subCutOff = customCrossover ? Number(customCrossover) / 2.9296875 : 63;

    const subCutOff = parseInt('200 Hz') / 3;
    const subDataPoints = this.calculatedChannelsData?.get('SW1')?.slice(0, subCutOff);

    // if (value) this.chartObj?.addSeries({});
    // else this.chartObj?.series.at(-1).destroy();

    if (this.chartOptions.series)
      if (checked) this.chartOptions.series[1] = {
        data: subDataPoints,
        type: 'spline',
        name: 'Subwoofer',
      };
      else this.chartOptions.series[1] = {
        data: [],
        type: 'spline',
      }

    this.chartUpdateFlag = true;
  }

  updateTargetCurve() {
    let data: any[] = this.audysseyData.enTargetCurveType == 1 ? [[20, 0],  [3600, 0], [9910, -2],[13300, -2.9], [16380, -4], [20000, -7]] :
      [[20, 0],  [3600, 0], [20000, -6]];

    if (this.selectedChannel?.midrangeCompensation) data.push([1000, 0], [1800, -3.6], [2000, -3.63], [3100, 0]);

    if (this.selectedChannel?.customTargetCurvePoints) {
      data = [
        ...convertToNonDraggablePoints(data),
        ...convertToDraggablePoints(this.selectedChannel?.customTargetCurvePoints)
          .filter(point => !(point.y == 0 && (point.x == 20 || point.x == 20000))),
      ].sort((a, b) => a.x! - b.x!);
    }
    console.log('updateTargetCurve() data', data);


    if (this.audysseyData.enTargetCurveType) {
      this.chartOptions.series![2] = {
        data,
        type: 'spline',
      };
    }

    this.chartUpdateFlag = true;
  }

  updateTargetCurve2() {
    const ROLLOFF_1_TARGET_CURVE: Array<[number, number]>  = [[20, 0],  [3600, 0], [20000, -6]];
    const ROLLOFF_2_TARGET_CURVE: Array<[number, number]>  = [[20, 0],  [3600, 0], [9910, -2],[13300, -2.9], [16380, -4], [20000, -7]];
    const MIDRANGE_COMPENSATION_CONTROL_POINTS: Array<[number, number]> = [[1000, 0], [1800, -3.6], [2000, -3.63], [3100, 0]];
    let targetCurve = this.audysseyData.enTargetCurveType == 2
      ? ROLLOFF_2_TARGET_CURVE
      : ROLLOFF_1_TARGET_CURVE;

    if (this.selectedChannel?.midrangeCompensation) {
      targetCurve = targetCurve.concat(MIDRANGE_COMPENSATION_CONTROL_POINTS);
    }

    const targetPoints = convertToNonDraggablePoints(targetCurve);
    let data = targetPoints;
    if (this.selectedChannel?.customTargetCurvePoints) {
      // if there are custom target curve points, they should override any built-in target curve points
      const customPoints = convertToDraggablePoints(this.selectedChannel?.customTargetCurvePoints);
      const customFreqs = new Set(customPoints.map(e => e.x));
      data = [
        ...targetPoints.filter(pt => !customFreqs.has(pt.x)),
        ...customPoints
      ];
    }

    data = data.sort((a, b) => a.x! - b.x!);

    console.log('data', data);

    if (this.audysseyData.enTargetCurveType) {
      this.chartOptions.series!.push({
        data,
        type: 'spline',
      });
    }

    this.chartUpdateFlag = true;
  }

  exportFile() {
    const blob = new Blob([JSON.stringify(this.audysseyData)], {type: 'application/ady'});
    const url = URL.createObjectURL(blob) // Create an object URL from blob

    const a = document.createElement('a') // Create "a" element
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', this.audysseyData.title + '_' + new Date().toLocaleDateString() + '.ady') // Set download filename
    a.click() // Start downloading
    URL.revokeObjectURL(url);
  }

  playChart(ev?: Event | Highcharts.Dictionary<any> | undefined) {
    console.log('playChart', ev)
    // this.chartObj?.toggleSonify();
  }

  async loadExample() {
    this.chartObj?.showLoading();
    const example = await fetch('assets/example-2-subs.ady').then(file => file.json());
    this.audysseyData = example;
    this.processDataWithWorker(example);
  }
}
