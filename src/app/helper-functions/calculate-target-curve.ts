import {PointOptionsObject} from "highcharts";

// Linear interpolation helper
function interpolate(x: number, x0: number, y0: number, x1: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
}

// Get Y value from a sorted array of points for a specific X
function getValueAtX(x: number, points: number[][]): number {
  // Find segment
  const i = points.findIndex(p => p[0] >= x);
  if (i === -1) return points[points.length - 1][1]; // past end
  if (i === 0) return points[0][1]; // before start

  const p0 = points[i - 1];
  const p1 = points[i];
  return interpolate(x, p0[0], p0[1], p1[0], p1[1]);
}

export function getBaseCurveValue(x: number, curveType?: 1|2, midrangeComp?: boolean): number {
  let standardCurve = curveType == 1 ?
    [[20, 0],  [3600, 0], [9910, -2], [13300, -2.9], [16380, -4], [20000, -6.5]] :
    [[20, 0],  [3600, 0], [20000, -6]];

  if (midrangeComp) {
    standardCurve.push([1000, 0], [1800, -3.6], [2000, -3.6], [3100, 0]);
    standardCurve.sort((a, b) => a[0] - b[0]);
  }

  return getValueAtX(x, standardCurve);
}

export function calculateTargetCurve(curveType?: 1|2, midrangeComp?: boolean, customPoints?: string[], frequencyLimit?: number): PointOptionsObject[] {
  // 1. Build Base Curve (System Points)
  let standardCurve = curveType == 1 ?
    [[20, 0],  [3600, 0], [9910, -2], [13300, -2.9], [16380, -4], [20000, -6.5]] :
    [[20, 0],  [3600, 0], [20000, -6]];

  if (midrangeComp) {
    // Insert MRC points, sort is needed because insertion might be out of order relative to standard curve
    standardCurve.push([1000, 0], [1800, -3.6], [2000, -3.6], [3100, 0]);
    standardCurve.sort((a, b) => a[0] - b[0]);
  }

  // 2. Parse User Control Points
  // These are explicit points the user added.
  // Format in string is "{Freq, Offset}" (e.g. "{1000, 2.5}" means +2.5dB at 1kHz relative to base)
  let userPoints = (customPoints || []).map(point => {
    const coords = point.replace(/[{}]/g, '').split(',');
    return { x: parseFloat(coords[0]), y: parseFloat(coords[1]) }; // y is the OFFSET here
  }).sort((a, b) => a.x - b.x);

  // 3. Anchor Logic
  // If user hasn't defined 20Hz or 20kHz, we assume 0dB offset at those extremes
  // to prevent the curve from "flying away" outside user points.
  // Use a separate array for interpolation so we don't corrupt the "real" user points (which are draggable)
  const interpolationPoints = [...userPoints];

  if (interpolationPoints.length === 0 || interpolationPoints[0].x > 20) {
    interpolationPoints.unshift({ x: 20, y: 0 });
  }
  if (interpolationPoints[interpolationPoints.length - 1].x < 20000) {
    interpolationPoints.push({ x: 20000, y: 0 });
  }

  // 4. Generate Display Curve
  // We need to combine Base Curve keypoints AND User Curve keypoints to ensure smooth lines.
  // We collect all unique X coordinates from both.
  const allX = new Set<number>();
  standardCurve.forEach(p => allX.add(p[0]));
  interpolationPoints.forEach(p => allX.add(p.x));

  let finalCurvePoints: {x: number, y: number, isUserPoint: boolean}[] = [];

  Array.from(allX).sort((a, b) => a - b).forEach(x => {
    // Base value at frequency X
    const baseVal = getValueAtX(x, standardCurve);

    // User Offset at frequency X (interpolated between user anchors)
    const userVal = (() => {
      const i = interpolationPoints.findIndex(p => p.x >= x);
      if (i === -1) return interpolationPoints[interpolationPoints.length - 1].y;
      if (i === 0) return interpolationPoints[0].y;
      const p0 = interpolationPoints[i - 1];
      const p1 = interpolationPoints[i];
      return interpolate(x, p0.x, p0.y, p1.x, p1.y);
    })();

    // Check if this specific X is an explicit user control point (for draggability)
    // We check against the ORIGINAL userPoints array
    const foundUserPoint = userPoints.find(p => Math.abs(p.x - x) < 0.01);

    // It is a user point if found, UNLESS it is 20Hz or 20kHz AND has 0 offset
    const isUserPoint = !!foundUserPoint && !(
      (Math.abs(x - 20) < 0.01 || Math.abs(x - 20000) < 0.01) &&
      foundUserPoint.y === 0
    );

    finalCurvePoints.push({
      x: x,
      y: baseVal + userVal,
      isUserPoint: isUserPoint,
    });
  });

  // 5. Convert to Highcharts format
  let highchartsSeries: PointOptionsObject[] = finalCurvePoints.map(p => {
    if (p.isUserPoint) {
      return {
        x: p.x,
        y: p.y,
        dragDrop: {draggableY: true, draggableX: false},
        marker: {enabled: true, radius: 4, states: {hover: {enabled: true}}},
        className: 'draggable-cursor'
      };
    } else {
      return {
        x: p.x,
        y: p.y,
        dragDrop: {draggableY: false, draggableX: false},
        marker: {enabled: false, states: {hover: {enabled: false}}}
      };
    }
  });

  // 6. Apply Frequency Limit (Clip)
  if (frequencyLimit && frequencyLimit < 20000) {
    // Cut off everything strictly greater than frequencyLimit
    const withinLimit = highchartsSeries.filter(p => (p.x as number) <= frequencyLimit);

    // We need to ensure the curve ends EXACTLY at frequencyLimit for visual correctness,
    // intersecting the calculated path.
    const lastP = withinLimit[withinLimit.length - 1];

    if (lastP && (lastP.x as number) < frequencyLimit) {
      const limitX = frequencyLimit;
      const baseAtLimit = getValueAtX(limitX, standardCurve);

      // Calculate offset at limit
      const i = interpolationPoints.findIndex(p => p.x >= limitX);
      let userOffsetAtLimit: number;

      if (i !== -1 && i !== 0) {
        const p0 = interpolationPoints[i - 1];
        const p1 = interpolationPoints[i];
        userOffsetAtLimit = interpolate(limitX, p0.x, p0.y, p1.x, p1.y);
      } else if (i === 0) {
        userOffsetAtLimit = interpolationPoints[0].y;
      } else {
        userOffsetAtLimit = interpolationPoints[interpolationPoints.length - 1].y;
      }

      withinLimit.push({
        x: limitX,
        y: baseAtLimit + userOffsetAtLimit,
        dragDrop: {draggableY: false, draggableX: false},
        marker: {enabled: false, states: {hover: {enabled: false}}},
      });
    }
    return withinLimit;
  }

  return highchartsSeries;
}
