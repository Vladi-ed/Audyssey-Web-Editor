export const options: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
      // key: 'ctrl',
    },
    panKey: 'shift',
    panning: {
      enabled: true,
      // type: 'x'
    },
    type: 'spline',
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
  boost: {
    // allowForce: true,
    pixelRatio: 1, // 2 makes that graph sharper but line width become 0.5
    seriesThreshold: 1,
    useGPUTranslations: true
  },
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
      xScale: {
        text: 'Switch to Linear scale'
      },
      dataSmoothing: {
        text: 'Data Smoothing'
      },
      graphSmoothing: {
        text: 'Graph Smoothing'
      }
    },
    buttons: {
      contextButton: {
        menuItems: ['viewFullscreen', 'downloadPNG', 'downloadSVG', 'separator', 'play', 'xScale', 'graphSmoothing']
      },
    },
    chartOptions: {
      title: {
        style: {
          fontFamily: 'Roboto, Arial, sans-serif',
          fontSize: '22px'
        }
      },
      credits: {
        enabled: false
      }
    }
  },
  sonification: {
    duration: 9500,
    defaultInstrumentOptions: {
      instrument: 'sine',

      mapping: {
        volume: 'y',
        noteDuration: {
          mapTo: '-x',
          mapFunction: 'logarithmic',
        },
        frequency: {
          mapTo: 'x',
          min: 0,
          max: 23000
        },
      }
    },
  },
  accessibility: { enabled: false },
  title: {
    text: 'Measurements graph'
  },
  subtitle: {
    text: 'First measurement'
  },
  tooltip: {
    headerFormat: '<b>{point.x:,.0f}</b> Hz<br/>',
    // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
    valueDecimals: 1,
    valueSuffix: ' dB',
    // shared: true,
  },
  xAxis: {
    min: 20,
    max: 20000,
    type: 'logarithmic',
    title: { text: 'Frequency (Hz)' },
    crosshair: true,
    accessibility: {
      description: 'Frequency'
    },
    // minRange: 1, // Set the minimum range for zooming - not working
  },
  yAxis: {
    min: -20,
    max: 25,
    title: { text: 'Amplitude (dB)' },
    crosshair: true,

    // tickInterval: 5,
    // minorTickInterval: 5
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
  legend: {
    enabled: false
  },
  credits: {
    enabled: false
  }
}


export const seriesOptions: Highcharts.SeriesOptionsType[] = [
  {
    name: 'Selected Channel',
    data: [],
    type: 'line',
    lineWidth: 1, // boost module renders only 1px lineWidth
    showInNavigator: true,
    dashStyle: 'Solid',
    zoneAxis: 'y',
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false,
        }
      }
    },
    dataGrouping: {
      // doesn't work well on logarithmic scale (and module import required)
      // https://github.com/highcharts/highcharts/issues/20547
      // enabled: true,
      groupPixelWidth: 10
    },
    zones: [
      {
        value: -10,
        color: '#f79d5c'
      },
      {
        value: 5,
        color: '#719f20'
      },
      {
        value: 10,
        color: '#d98f52'
      },
      {
        value: 20,
        color: '#ff0000'
      },
      {
        color: '#c93737'
      },
    ],
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
    color: 'green',
    marker: {
      // lineWidth: 2,
      // radius: 1,
      // enabled: false,
      symbol: 'round'
    },
    // states: { hover: { enabled: false } },

    dragDrop: {
      draggableY: true,
      draggableX: true,
      dragMaxY: 12, dragMinY: -12,
      // dragPrecisionX: 10
    },
    stickyTracking: false,
    allowPointSelect: true,

    enableMouseTracking: false // to disable dragging
  }
];
