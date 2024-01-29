export function convertToDraggablePoints(arr: string[]): Highcharts.PointOptionsObject[] {
  return arr.map(point => {
    const coordinates = point.replace(/[{}]/g, '').split(',');
    return {
      x: parseFloat(coordinates[0]),
      y: parseFloat(coordinates[1]),
      dragDrop: {draggableY: true, draggableX: true, dragMaxX: parseFloat(coordinates[0]) + 20, dragMinX: parseFloat(coordinates[0]) - 20},
      marker: {enabled: true}
    }
  })
}

export function convertToNonDraggablePoints(arr: Array<[number, number]>): Highcharts.PointOptionsObject[] {
  return arr.map(point => {
    return {
      x: point[0],
      y: point[1],
      dragDrop: {draggableY: false, draggableX: false},
      marker: {enabled: false, states: {hover: {enabled: false}}},
    }
  })
}
