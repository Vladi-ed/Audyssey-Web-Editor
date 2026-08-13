import { Options, Point, SeriesOptionsType } from 'highcharts';

export const initOptions: Options = {
  // Highcharts 13 defaults to adapting its palette to the system color scheme.
  // The editor has a fixed light Material theme, so keep the chart aligned with it.
  palette: {
    colorScheme: 'light',
  },
  responsive: {
    rules: [{
      chartOptions: {
        subtitle: { text: '' },
        yAxis: {
          enabled: false,
          labels: { enabled: false },
          title: { text: '' }
        }
      },
      condition: { maxWidth: 500 }
    }]
  },
  chart: {
    animation: true,
    style: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
    zooming: {
      type: 'x',
      // key: 'ctrl',
    },
    spacingTop: 15,
    panKey: 'shift',
    panning: {
      enabled: true,
      // type: 'x'
    },
    // events: {
    //   // add points on CLick
    //   click: function (e) {
    //     // @ts-ignore
    //     const x = Math.round(e.xAxis[0].value);
    //     // @ts-ignore
    //     const y = Math.round(e.yAxis[0].value);
    //
    //     console.log(x, y);
    //     console.log(e);
    //
    //     this.series[2].addPoint({
    //       x, y
    //     });
    //   }
    // }
  },
  // boost: {
  //   // allowForce: true,
  //   pixelRatio: 1, // 2 makes that graph sharper but line width become 0.5
  //   seriesThreshold: 1,
  //   useGPUTranslations: true
  // },
  exporting: {
    sourceWidth: 1920,
    menuItemDefinitions: {
      // Custom definition
      // play: {
      //   onclick: function () {
      //     this.toggleSonify()
      //   },
      //   text: 'Play'
      // },
      xScaleBtn: { text: 'Switch to Linear scale' },
      dataSmoothingBtn: { text: 'Data Smoothing' },
      graphSmoothingBtn: { text: 'Graph Smoothing' }
    },
    buttons: {
      contextButton: {
        menuItems: ['viewFullscreen', 'downloadPNG', 'downloadSVG', 'separator', 'xScaleBtn', 'graphSmoothingBtn'],
        symbolStroke: '#666666',
        theme: {
          fill: 'transparent',
          stroke: 'transparent',
        }
      },
    },
    chartOptions: {
      title: {
        style: {
          fontFamily: 'Roboto, Arial, sans-serif',
          fontSize: '22px'
        }
      },
      credits: { enabled: false }
    }
  },
  // sonification: {
  //   duration: 9500,
  //   defaultInstrumentOptions: {
  //     instrument: 'sine',
  //     mapping: {
  //       volume: 'y',
  //       noteDuration: {
  //         mapTo: '-x',
  //         mapFunction: 'logarithmic',
  //       },
  //       frequency: {
  //         mapTo: 'x',
  //         min: 0,
  //         max: 23000
  //       },
  //     }
  //   },
  // },
  accessibility: { enabled: false },
  title: {
    text: 'Measurements graph',
    style: { color: '#333333', fontSize: '21px', fontWeight: '600' }
  },
  subtitle: {
    text: '',
    style: { color: '#666666', fontSize: '12px' }
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#999999',
    borderRadius: 3,
    style: { color: '#333333' },
    // headerFormat: '<b>{point.x:,.0f}</b> Hz<br/>',
    headerFormat: '<div class="tooltip-header">{series.name}</div>',
    pointFormatter: function(this: Point) {
      const freqStr = this!.x > 1000
        ? `${(this!.x / 1000).toFixed(2)} kHz`
        : `${Math.round(this!.x)} Hz`;
      return `
          <div style="padding-left: 4px">
            <div>Frequency: &nbsp;<b>${freqStr}</b></div>
            <div>Amplitude: <b>${this!.y! > 0 ? "+" : ""}${this!.y!.toFixed(1)} dB</b> <span style="color: ${this!.color}; font-size: 17px">●</span></div>
          </div> `;
    },
    // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
    // valueSuffix: ' dB',
    useHTML: true,
  },
  xAxis: {
    min: 20,
    max: 20000,
    type: 'logarithmic',
    title: { text: 'Frequency (Hz)', style: { color: '#666666' } },
    lineColor: '#333333',
    tickColor: '#333333',
    gridLineColor: '#e6e6e6',
    minorGridLineColor: '#f2f2f2',
    labels: { style: { color: '#333333' } },
    crosshair: true,
    // minRange: 1, // Set the minimum range for zooming - not working
  },
  yAxis: {
    min: -20,
    max: 25,
    title: { text: 'Amplitude (dB)', style: { color: '#666666' } },
    gridLineColor: '#e6e6e6',
    lineColor: '#333333',
    labels: { style: { color: '#333333' } },
    crosshair: true,
  },
  // plotOptions: {
  //   series: {
  //     stickyTracking: false,
  //     marker: {
  //       enabled: false,
  //     },
  //     point: {
  //       events: {
  //         click: function (ev) {
  //           console.log(ev)
  //           if (this.series.data.length > 1 && ev.ctrlKey) {
  //             this.remove();
  //           }
  //         }
  //       }
  //     }
  //   }
  // },
  legend: { enabled: false },
  credits: { enabled: false }
}

export const lightChartTheme: Options = {
  palette: { colorScheme: 'light' },
  chart: {
    backgroundColor: '#ffffff',
    plotBackgroundColor: '#ffffff',
    // plotBorderColor: 'transparent',
    // plotBorderWidth: 0,
    borderRadius: 10,
    style: { fontFamily: 'Roboto, Arial, sans-serif' },
  },
  title: { style: { color: '#333333', fontSize: '21px', fontWeight: '600' } },
  subtitle: { style: { color: '#666666', fontSize: '12px' } },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#999999',
    borderRadius: 3,
    style: { color: '#333333' },
  },
  xAxis: {
    title: { style: { color: '#666666' } },
    lineColor: '#333333',
    tickColor: '#333333',
    gridLineColor: '#e6e6e6',
    minorGridLineColor: '#f2f2f2',
    labels: { style: { color: '#333333' } },
  },
  yAxis: {
    title: { style: { color: '#666666' } },
    gridLineColor: '#e6e6e6',
    lineColor: '#333333',
    labels: { style: { color: '#333333' } },
  },
  exporting: {
    buttons: {
      contextButton: {
        symbolStroke: '#666666',
        theme: { fill: 'transparent', stroke: 'transparent' },
      },
    },
  },
};

export const darkChartTheme: Options = {
  palette: { colorScheme: 'dark' },
  chart: {
    backgroundColor: 'transparent',
    plotBackgroundColor: 'rgba(4, 15, 32, 0.34)',
    plotBorderColor: 'rgba(102, 142, 191, 0.22)',
    plotBorderWidth: 1,
    borderRadius: 12,
    style: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
  },
  title: { style: { color: '#eef5ff', fontSize: '21px', fontWeight: '600' } },
  subtitle: { style: { color: '#9baac1', fontSize: '12px' } },
  tooltip: {
    backgroundColor: 'rgba(7, 20, 40, 0.96)',
    borderColor: '#41688f',
    borderRadius: 8,
    style: { color: '#eef5ff' },
  },
  xAxis: {
    title: { style: { color: '#7f90aa' } },
    lineColor: '#3b526f',
    tickColor: '#3b526f',
    gridLineColor: 'rgba(95, 134, 181, 0.12)',
    minorGridLineColor: 'rgba(95, 134, 181, 0.06)',
    labels: { style: { color: '#9baac1' } },
  },
  yAxis: {
    title: { style: { color: '#7f90aa' } },
    gridLineColor: 'rgba(95, 134, 181, 0.14)',
    lineColor: '#3b526f',
    labels: { style: { color: '#9baac1' } },
  },
  exporting: {
    buttons: {
      contextButton: {
        symbolStroke: '#9baac1',
        theme: { fill: 'transparent', stroke: 'transparent' },
      },
    },
  },
};


export const seriesOptions: SeriesOptionsType[] = [
  {
    name: 'Selected Channel',
    data: [],
    type: 'line',
    lineWidth: 1, // boost module renders only 1px lineWidth
    color: '#719f20',
    showInNavigator: true,
    dashStyle: 'Solid',
    zoneAxis: 'y',
    allowPointSelect: true,
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false,
        }
      }
    },
    zones: [
      { value: -10, color: '#f79d5c' },
      { value: 5, color: '#719f20' },
      { value: 10, color: '#d98f52' },
      { value: 20, color: '#ff0000' },
      { color: '#c93737' },
    ],
    // dataGrouping: {
    //   // doesn't work well on logarithmic scale (and module import required)
    //   // https://github.com/highcharts/highcharts/issues/20547
    //   // enabled: true,
    //   groupPixelWidth: 10
    // },
  },
  {
    name: 'Subwoofer',
    data: [],
    dashStyle: 'Dot',
    lineWidth: 0.8,
    type: 'spline',
    color: 'black',
  },
  {
    name: 'Target curve',
    data: [],
    // lineWidth: 2,
    type: 'spline',
    color: '#008000',
    lineWidth: 2,
    marker: {
      lineWidth: 0,
      lineColor: '#008000',
      fillColor: '#008000',
      radius: 4,
      symbol: 'circle'
    },
    // states: { hover: { enabled: false } },

    dragDrop: {
      draggableY: true,
      dragMaxY: 12,
      dragMinY: -12,
      dragPrecisionY: 0.1,
      dragPrecisionX: 1,
    },
    stickyTracking: false,

    // enableMouseTracking: false // to disable dragging
  }
];
