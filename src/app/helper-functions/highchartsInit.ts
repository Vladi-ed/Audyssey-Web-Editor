export const highchartsInit: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x'
    },
    type: 'spline',
  },
  // boost: {
  //   enabled: true,
  //   useGPUTranslations: true
  // },
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

  legend: {
    enabled: false
  }
}
