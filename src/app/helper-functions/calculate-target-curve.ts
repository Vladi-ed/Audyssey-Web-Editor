import {convertToDraggablePoints, convertToNonDraggablePoints} from "./convert-draggable-points";

export function calculateTargetCurve(curveType?: 1|2, midrangeComp?: boolean, customPoints?: string[], frequencyLimit?: number) {
  let standardCurve = curveType == 1 ?
    [[20, 0],  [3600, 0], [9910, -2], [13300, -2.9], [16380, -4], [20000, -6.5]] :
    [[20, 0],  [3600, 0], [20000, -6]];

  if (midrangeComp) standardCurve.push([1000, 0], [1800, -3.6], [2000, -3.6], [3100, 0]);

  const customCurve =  [
    ...convertToNonDraggablePoints(standardCurve),
    ...convertToDraggablePoints(customPoints || [])
      .filter(point => !(point.y == 0 && (point.x == 20 || point.x == 20000))),
  ].sort((a, b) => (a.x as number) - (b.x as number));


  // remove target curve points after the frequency Limit
  if (frequencyLimit && frequencyLimit < 20000) {
    const lastPoint = customCurve.findIndex(point => (point.x as number) > frequencyLimit);
    return customCurve.slice(0, lastPoint + 1);
  }

  return customCurve;
}
