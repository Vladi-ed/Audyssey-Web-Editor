import type { PointOptionsObject } from 'highcharts';
import { getTargetCurveBoundaryPoints } from './target-curve-boundaries';
import { getTargetRolloff } from './target-curve-cutoff';

// A few rounded anchors are enough for this approximate visual target.
function getBaseCurvePoints(curveType?: 1|2, midrangeComp?: boolean): number[][] {
  const points = curveType == 1 ?
    [[20, 0], [3600, midrangeComp ? -0.47 : -0.02],
      [9910, midrangeComp ? -1.87 : -1.85], [13300, midrangeComp ? -2.79 : -2.78],
      [16380, -4.25], [20000, -6.91]] :
    [[20, 0], [3600, midrangeComp ? -0.47 : -0.02], [20000, -6.11]];

  if (midrangeComp) {
    points.push([1000, -0.31], [1800, -3.39], [2000, -3.55], [3100, -0.84]);
    points.sort((a, b) => a[0] - b[0]);
  }
  return points;
}

function getValueAtX(x: number, points: number[][], custom = false): number {
  const index = points.findIndex(point => point[0] >= x);
  if (index === -1) return points[points.length - 1][1];
  if (index === 0) return points[0][1];
  const [x0, y0] = points[index - 1];
  const [x1, y1] = points[index];
  if (x1 === x0) return y0;
  let t = (x - x0) / (x1 - x0);
  if (custom) {
    // Android uses two quadratic pieces in log-frequency space for custom gains.
    t = Math.log(x / x0) / Math.log(x1 / x0);
    t = t <= 0.5 ? 2 * t * t : 1 - 2 * (1 - t) ** 2;
  }
  return y0 + t * (y1 - y0);
}

export function getBaseCurveValue(x: number, curveType?: 1|2, midrangeComp?: boolean, cutoff = 0): number {
  return getValueAtX(x, getBaseCurvePoints(curveType, midrangeComp)) + getTargetRolloff(x, cutoff);
}

export function calculateTargetCurve(curveType?: 1|2, midrangeComp?: boolean, customPoints?: string[], frequencyLimit?: number, cutoff = 0): PointOptionsObject[] {
  const standardCurve = getBaseCurvePoints(curveType, midrangeComp);
  // Stored gains are offsets from the base target, including its low-end rolloff.
  const userPoints = (customPoints ?? []).map(point =>
    point.replace(/[{}]/g, '').split(',').map(Number)).sort((a, b) => a[0] - b[0]);
  const interpolationPoints = [
    ...userPoints,
    ...getTargetCurveBoundaryPoints(userPoints.map(point => point[0])).map(point => [point.x, point.y]),
  ].sort((a, b) => a[0] - b[0]);
  const baseline = (frequency: number) => getValueAtX(frequency, standardCurve) + getTargetRolloff(frequency, cutoff);
  const frequencies = new Set([...standardCurve, ...interpolationPoints].map(point => point[0]));

  // A small number of samples preserves the native offset shape and filter knee.
  for (let i = 1; i < interpolationPoints.length; i++) {
    const [x0, y0] = interpolationPoints[i - 1];
    const [x1, y1] = interpolationPoints[i];
    if (y0 === y1) continue;
    for (let step = 1; step < 8; step++) frequencies.add(x0 * (x1 / x0) ** (step / 8));
  }
  if (cutoff >= 40) {
    for (let frequency = 20; frequency < Math.min(20000, cutoff * 8); frequency *= Math.SQRT2) {
      frequencies.add(frequency);
    }
    frequencies.add(cutoff);
  }
  if (frequencyLimit && frequencyLimit < 20000) frequencies.add(frequencyLimit);

  return Array.from(frequencies).filter(x => !frequencyLimit || x <= frequencyLimit)
    .sort((a, b) => a - b).map(x => {
      const base = baseline(x);
      const userPoint = userPoints.find(point => point[0] === x);
      const editable = !!userPoint && !((x === 20 || x === 20000) && userPoint[1] === 0);
      return {
        x,
        y: base + getValueAtX(x, interpolationPoints, true),
        dragDrop: {
          draggableY: editable,
          draggableX: false,
          dragMinY: base - 12,
          dragMaxY: base + 12,
        },
        marker: { enabled: editable, radius: 4, states: { hover: { enabled: editable } } },
        className: editable ? 'draggable-cursor' : undefined,
      };
    });
}
