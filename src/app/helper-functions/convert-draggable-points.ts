import { PointOptionsObject } from "highcharts";

export function convertToDraggablePoints(arr: string[]): PointOptionsObject[] {
  return arr.map((point, index) => {
    const coordinates = point.replace(/[{}]/g, '').split(',');

    // for draggable on X-axis (not working yet)
    // const previousX = parseInt(arr[index-1]?.replace(/[{}]/g, '').split(',').shift() || '20', 10);
    // const nextX = parseInt(arr[index+1]?.replace(/[{}]/g, '').split(',').shift() || '1000', 10);
    // console.log(previousX, coordinates[0], nextX)

    return {
      x: parseFloat(coordinates[0]),
      y: parseFloat(coordinates[1]),
      // dragDrop: {draggableY: true, draggableX: false, dragMinX: previousX, dragMaxX: nextX},
      dragDrop: {draggableY: arr.length < 200, draggableX: false},
      marker: {enabled: arr.length < 200},
      className: 'draggable-cursor'
    }
  })
}

export function convertToNonDraggablePoints(arr: number[][]): PointOptionsObject[] {
  return arr.map(point => {
    return {
      x: point[0],
      y: point[1],
      dragDrop: {draggableY: false, draggableX: false},
      marker: {enabled: false, states: {hover: {enabled: false}}},
    }
  })
}
