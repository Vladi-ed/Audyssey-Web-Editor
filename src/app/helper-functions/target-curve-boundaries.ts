// Match Original app half-octave margin, including its strict comparisons.
export function getTargetCurveBoundaryPoints(frequencies: readonly number[]): { x: number; y: number }[] {
    const boundaries = [];
    if (!frequencies.some(frequency => frequency / Math.SQRT2 < 20)) {
        boundaries.push({ x: 20, y: 0 });
    }
    if (!frequencies.some(frequency => frequency * Math.SQRT2 > 20000)) {
        boundaries.push({ x: 20000, y: 0 });
    }
    return boundaries;
}

// Treat exact zero endpoints as implicit when editing.
// Keep all other point strings intact; apply this only when committing edits or previewing them.
export function prepareTargetCurvePointsForSave(points: readonly string[]): string[] {
    const edited = points.filter(point => {
        const [frequency, gain] = point.replace(/[{}]/g, '').split(',').map(Number);
        return !((frequency === 20 || frequency === 20000) && gain === 0);
    });
    const frequencyOf = (point: string) => Number.parseFloat(point.substring(1));
    const boundaries = getTargetCurveBoundaryPoints(edited.map(frequencyOf));
    return [...edited, ...boundaries.map(point => `{${point.x}, 0}`)]
        .sort((a, b) => frequencyOf(a) - frequencyOf(b));
}
