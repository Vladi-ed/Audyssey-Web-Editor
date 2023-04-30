import {Component} from '@angular/core';
import {AudysseyRoot} from "./interfaces/audyssey-root";
import {DetectedChannel} from "./interfaces/detected-channel";
import {decodeChannelName} from "./helper-functions/decodeChannelName";
import {calculatePoints} from "./helper-functions/calculatePoints";

import * as Highcharts from "highcharts";
import HC_boost from 'highcharts/modules/boost'
import {highchartsInit} from "./helper-functions/highchartsInit";
HC_boost(Highcharts);
Highcharts.setOptions(highchartsInit);
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    series: [{
      data: [],
      type: 'line'
    },
      {
        data: [],
        dashStyle: 'Dot',
        lineWidth: 0.7,
        type: 'spline',
        name: 'Subwoofer',
        color: 'black',

      }
    ],
  };
  // private chartSeries: Highcharts.SeriesOptionsType[] = [];
  private chartObj?: Highcharts.Chart;

  audysseyData: AudysseyRoot = { detectedChannels: [] };
  selectedChannel?: DetectedChannel;
  protected readonly decodeChannelName = decodeChannelName; // for the template
  chartLogarithmicScale = true;
  chartUpdateFlag = false;
  dataSmoothEnabled = true;
  graphSmoothEnabled = false;
  addSubwoofer = false;
  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartObj = chart;
  }

  onUpload(target: FileList | null) {
    const file = target?.item(0);
    file?.text().then(fileContent => this.audysseyData = JSON.parse(fileContent));
  }

  updateChart() {
    const selectedChannelData = calculatePoints(this.selectedChannel?.responseData[0], this.dataSmoothEnabled);

    const XMin = 10, XMax = 24000;

    this.chartOptions.title = {
      text: decodeChannelName(this.selectedChannel?.commandId)
    };

    this.chartOptions.xAxis = {
      min: XMin,
      max: XMax,
      title: {text: 'Hz'},
      type: this.chartLogarithmicScale ? "logarithmic" : "linear",
      plotBands: [{
        from: this.selectedChannel?.frequencyRangeRolloff,
        to: XMax,
        color: 'rgba(68, 170, 213, 0.1)',
        label: {
          text: 'Disabled',
          style: {
            color: '#606060'
          }
        }
      }]
    };

    // add Crossover if it's a logarithmic scale
    if (this.selectedChannel?.customCrossover && this.chartLogarithmicScale) this.chartOptions.xAxis.plotBands?.push({
      from: XMin,
      to: Number(this.selectedChannel.customCrossover),
      color: 'rgba(160, 160, 160, 0.1)',
      label: {
        text: 'Crossover',
        style: {
          color: '#606060'
        }
      }
    })

    this.chartOptions.yAxis = {
      // min: -20,
      // max: 25,
      // crosshair: true,
      tickInterval: 5,
      // minorTickInterval: 5
    };

    // @ts-ignore
    this.chartOptions.series[0] = {
      data: selectedChannelData,
      lineWidth: 0.8,
      showInNavigator: true,
      dashStyle: 'Solid',
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      // allowPointSelect: true,
      name: decodeChannelName(this.selectedChannel?.commandId),
      zones: [
        {
          value: 0,
          color: '#f7a35c'
        },
        {
          value: 10,
          color: '#c47f7f'
        },
        {
          value: 30,
          color: '#ff0000'
        },
        {
          color: '#90ed7d'
        }],
    };

    this.chartUpdateFlag = true;
  }

  addSubwooferToTheGraph(value: boolean) {
    const subDataValues = this.audysseyData.detectedChannels.at(-1)?.responseData[0] || [];
    const subDataPoints = calculatePoints(subDataValues, false).slice(0, 62);

    if (value) this.chartObj?.addSeries({
      data: subDataPoints,
      dashStyle: 'Dot',
      lineWidth: 0.7,
      type: 'spline',
      name: 'Subwoofer',
      color: 'black'
    });
    else this.chartObj?.series.pop();

    // this.chartOptions = {...this.chartOptions, series: this.chartSeries}

    // this.chartUpdateFlag = true;
    console.log('chartOptions.series', this.chartOptions.series)

  }

}
