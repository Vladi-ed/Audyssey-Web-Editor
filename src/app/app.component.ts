import {Component} from '@angular/core';
import * as Highcharts from "highcharts";
import HC_boost from 'highcharts/modules/boost'
HC_boost(Highcharts);
import {AudysseyRoot} from "./interfaces/audyssey-root";
import {DetectedChannel} from "./interfaces/detected-channel";
import {decodeChannelName} from "./helper-functions/decodeChannelName";
import { complex, Complex, abs as magnitude, fft } from 'mathjs'
import {LinSpacedFracOctaveSmooth} from "./helper-functions/smooth";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      zooming: {
        type: "x"
      },
      type: 'spline',
    },
    // boost: {
    //   enabled: true,
    //   useGPUTranslations: true
    // },
    title: {
      text: 'Left channel'
    },
    subtitle: {
      text: 'First measurement'
    },
    tooltip: {
      headerFormat: '<b>{point.x:,.0f}</b> Hz<br/>',
      // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
      valueDecimals: 1,
      valueSuffix: ' Db',
    },
    xAxis: {
      min: 20,
      max: 20000,
      title: {text: 'Hz'},
      crosshair: true,
      accessibility: {
        description: 'Frequency'
      },
      type: "logarithmic"
    },
    series: [{
      data: [[20, 0], [20000, 0]],
      type: 'line'
    }],
    legend: {
      enabled: false
    }
  };

  audysseyData: AudysseyRoot = {
    detectedChannels: []
  };
  selectedChannel?: DetectedChannel;
  protected readonly decodeChannelName = decodeChannelName;
  chartLogarithmicScale = true;
  chartUpdateFlag = false;
  dataSmoothEnabled = true;
  graphSmoothEnabled = false;

  onUpload(target: FileList | null) {
    const file = target?.item(0);
    file?.text().then(fileContent => this.processData(fileContent));
  }

  private processData(content: string) {
    this.audysseyData = JSON.parse(content);

    const selectedChannel = this.audysseyData.detectedChannels[0];

    let points: number[][] = []
    // let s = primalData[i].toString();

    let values = selectedChannel.responseData[0];
    let count = values.length;
    let cValues: Complex[] = new Array(count);
    let Xs: number[] = new Array(count);

    let sample_rate = 48000;
    let total_time = count / sample_rate;
    let selectedAxisLimits;
    let XMin = 10, XMax = 24000, YMin = -20, YMax = 25;


    for (let j = 0; j < count; j++) {
      cValues[j] = complex(parseFloat(values[j]))
      Xs[j] = j / count * sample_rate;
    }

    console.log('cValues', cValues);

    cValues = fft(cValues);
    console.log('cValuesFFT', cValues);
    console.log('magnitude', magnitude(cValues[0]));


    let x = 0;

    if (this.dataSmoothEnabled) {

      let smoothed = new Array(count);
      for (let j = 0; j < count; j++) {
        smoothed[j] = magnitude(cValues[j]);
      }

      smoothed = LinSpacedFracOctaveSmooth(smoothed);

      for (let smoothedResult of smoothed) {
        points.push([Xs[x++], 20 * Math.log10(smoothedResult) ]);
        if (x == count / 2) break;
      }

    }
    else for (let cValue of cValues) {
      points.push([Xs[x++], 20 * Math.log10(magnitude(cValue) as unknown as number)]);
      if (x == count / 2) break;
    }

    console.log('convertedValues', points)

    this.chartOptions.xAxis = {
      min: XMin,
      max: XMax,
      title: {text: 'Hz'},
      type: this.chartLogarithmicScale ? "logarithmic" : "linear",
      plotBands: [{ // Light air
        from: selectedChannel.frequencyRangeRolloff,
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

    this.chartOptions.yAxis = {
      min: YMin,
      max: YMax,
      crosshair: true,
      tickInterval: 5,
      // minorTickInterval: 5
    };

    this.chartOptions.series = [{
      data: points,
      lineWidth: 0.8,
      dashStyle: "Solid",
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      allowPointSelect: true,
      name: decodeChannelName(this.audysseyData.detectedChannels[0].commandId),
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
    }];

    this.chartUpdateFlag = true;
  }

  updateChart() {
    let points: number[][] = [];

    let values = this.selectedChannel?.responseData[0] || [];
    let count = values.length;
    let cValues: Complex[] = new Array(count);
    let Xs: number[] = new Array(count);

    let sample_rate = 48000;
    let total_time = count / sample_rate;
    let selectedAxisLimits;
    let XMin = 10, XMax = 24000, YMin = -20, YMax = 25;


    for (let j = 0; j < count; j++) {
      cValues[j] = complex(parseFloat(values[j]))
      Xs[j] = j / count * sample_rate;
    }

    console.log('cValues', cValues);

    cValues = fft(cValues);
    console.log('cValuesFFT', cValues);
    console.log('magnitude', magnitude(cValues[0]));


    let x = 0;

    if (this.dataSmoothEnabled) {

      let smoothed = new Array(count);
      for (let j = 0; j < count; j++) {
        smoothed[j] = magnitude(cValues[j]);
      }

      smoothed = LinSpacedFracOctaveSmooth(smoothed);

      for (let smoothedResult of smoothed) {
        points.push([Xs[x++], 20 * Math.log10(smoothedResult) ]);
        if (x == count / 2) break;
      }

    }
    else for (let cValue of cValues) {
      points.push([Xs[x++], 20 * Math.log10(magnitude(cValue) as unknown as number)]);
      if (x == count / 2) break;
    }

    this.chartOptions.xAxis = {
      min: XMin,
      max: XMax,
      title: {text: 'Hz'},
      type: this.chartLogarithmicScale ? "logarithmic" : "linear",
      plotBands: [{ // Light air
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

    this.chartOptions.yAxis = {
      min: YMin,
      max: YMax,
      crosshair: true,
      tickInterval: 5,
      // minorTickInterval: 5
    };

    this.chartOptions.series = [{
      data: points,
      lineWidth: 0.8,
      dashStyle: "Solid",
      type: this.graphSmoothEnabled ? 'spline' : 'line',
      allowPointSelect: true,
      name: decodeChannelName(this.audysseyData.detectedChannels[0].commandId),
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
    }];

    this.chartUpdateFlag = true;

  }

}
