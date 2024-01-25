import {Component} from '@angular/core';
import {AudysseyInterface} from './interfaces/audyssey-interface';
import {DetectedChannel} from './interfaces/detected-channel';
import {decodeChannelName} from './helper-functions/decode-channel-name.pipe';

import * as Highcharts from 'highcharts';
// import Sonification from 'highcharts/modules/sonification';
import HC_boost from 'highcharts/modules/boost'
import Draggable from 'highcharts/modules/draggable-points';
import Exporting from 'highcharts/modules/exporting';
import {options, seriesOptions} from './helper-functions/highcharts-options';

// Sonification(Highcharts);
// Draggable(Highcharts);
HC_boost(Highcharts);
Exporting(Highcharts);
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
  dataSmoothEnabled = true;
  graphSmoothEnabled = false;

  // Whether or not the imported ADY file only uses two digits for crossovers over
  // 100Hz (e.g. a value of "12" = 120Hz)
  private twoDigitCrossovers = false;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    console.log('Highcharts loaded');
    if (chart.options.exporting?.menuItemDefinitions)
    {
      chart.options.exporting.menuItemDefinitions['xScale'].onclick = () => {
        this.chartLogarithmicScale = !this.chartLogarithmicScale;
        this.updateChart();
      }
      chart.options.exporting.menuItemDefinitions['graphSmoothing'].onclick = () => {
        this.graphSmoothEnabled = !this.graphSmoothEnabled;
        this.updateChart();
      }
      chart.options.exporting.menuItemDefinitions['dataSmoothing'].onclick = () => {
        this.dataSmoothEnabled = !this.dataSmoothEnabled;
        this.updateChart();
      }
    }
    this.chartObj = chart;
  }

  async onUpload(files: FileList | null) {
    const fileContent = await files?.item(0)?.text();
    if (fileContent) {
      this.chartObj?.showLoading();
      this.audysseyData = JSON.parse(fileContent);

      // Audyssey appears to store the crossover frequency using two digits
      // in some cases, so for values > 100 we need to multiply by 10
      this.audysseyData.detectedChannels.forEach(channelInfo => {
        if (channelInfo?.customCrossover) {
          let crossOverFreq = Number(channelInfo.customCrossover);
          if (crossOverFreq < 40) {
            this.twoDigitCrossovers = true;
            crossOverFreq *= 10;
            channelInfo.customCrossover = `${crossOverFreq}`;
          }
        };
      });

      this.processDataWithWorker(this.audysseyData);
    }
    else alert('Cannot read the file');
  }

  processDataWithWorker(json: AudysseyInterface) {
    console.log(json);

    if (typeof Worker !== 'undefined') { // if supported
      const worker = new Worker(new URL('./helper-functions/bg-calculator.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log('Got a message from Web-Worker');
        this.calculatedChannelsData = data;
        this.selectedChannel = json.detectedChannels[0];
        this.updateChart();
        this.chartObj?.hideLoading();
      };
      worker.postMessage(json.detectedChannels);
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

    this.chartOptions.xAxis = {
      min: XMin,
      max: XMax,
      type: this.chartLogarithmicScale ? "logarithmic" : "linear",
      plotBands: [{
        from: this.selectedChannel?.frequencyRangeRolloff,
        to: XMax,
        color: 'rgba(68, 170, 213, 0.1)',
        label: {
          text: 'Disabled',
          style: { color: '#606060' }
        }
      }]
    };

    // add Crossover if it's a logarithmic scale
    if (this.selectedChannel?.customCrossover && this.chartLogarithmicScale)
      this.chartOptions.xAxis.plotBands?.push({
      from: XMin,
      to: Number(this.selectedChannel.customCrossover),
      color: 'rgba(160, 160, 160, 0.1)',
      label: {
        text: 'Crossover',
        style: { color: '#606060' }
      }
    });

    // const selectedChannelData = calculatePoints(this.selectedChannel?.responseData[0], this.dataSmoothEnabled);
    const selectedChannelData = this.calculatedChannelsData?.get(this.selectedChannel!.commandId);

    // adding first graph
    // @ts-ignore
    this.chartOptions.series[0] = {
      data: selectedChannelData,
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      name: decodeChannelName(this.selectedChannel?.commandId),
    };

    this.updateTargetCurve();
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

    function convertToDraggablePoints(arr: string[]): Highcharts.PointOptionsObject[] {
      return arr.map(point => {
        const coordinates = point.replace(/[{}]/g, '').split(',');
        return {
          x: parseFloat(coordinates[0]),
          y: parseFloat(coordinates[1]),
          dragDrop: {draggableY: true, dragMaxY: 12, dragMinY: -12},
          marker: {enabled: true}
        }
      })
    }

    function convertToNonDraggablePoints(arr: number[][]): Highcharts.PointOptionsObject[] {
      return arr.map(point => {
        return {
          x: point[0],
          y: point[1],
          dragDrop: {draggableY: false},
          marker: {enabled: false, states: {hover: {enabled: false}}},
        }
      });
    }

    if (this.selectedChannel?.customTargetCurvePoints) {
      data = [
        ...convertToNonDraggablePoints(data),
        ...convertToDraggablePoints(this.selectedChannel?.customTargetCurvePoints)
          .filter(point => !(point.y == 0 && (point.x == 20 || point.x == 20000))),
      ].sort((a, b) => a.x! - b.x!);
    }
    console.log('data', data);


    if (this.audysseyData.enTargetCurveType) {
      this.chartOptions.series![2] = {
        data,
        type: 'spline',
      };
    }

    this.chartUpdateFlag = true;
  }

  exportFile() {
    let data = this.audysseyData;
    if (this.twoDigitCrossovers) {
      // If the ADY file had two-digit crossover frequencies (eg '10' for 100hz) then convert back
      // when we export
      data = {
        ...data, 
        detectedChannels: data.detectedChannels.map(channel => {
          const crossOverFreq = Number(channel.customCrossover ?? '0');
          return crossOverFreq < 100 ? channel : {...channel, customCrossover: `${crossOverFreq / 10}`};
        })
      }
    }

    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob) // Create an object URL from blob

    const a = document.createElement('a') // Create "a" element
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', data.title + '_' + new Date().toLocaleDateString() + '.ady') // Set download filename
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
