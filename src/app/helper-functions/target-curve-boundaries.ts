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

// A 0 dB point at 20 Hz or 20 kHz is a generated boundary, not a user point.
export function isImplicitBoundaryPoint(frequency: number, gain: number): boolean {
    return gain === 0 && (frequency === 20 || frequency === 20000);
}

// Treat exact zero endpoints as implicit when editing.
// Keep all other point strings intact; apply this only when committing edits or previewing them.
export function prepareTargetCurvePointsForSave(points: readonly string[]): string[] {
    const coordinates = points.map(text => {
        const [frequency, gain] = text.replace(/[{}]/g, '').split(',').map(Number);
        return { frequency, gain, text };
    });
    const saved = coordinates.filter(point => !isImplicitBoundaryPoint(point.frequency, point.gain));

    for (const boundary of getTargetCurveBoundaryPoints(saved.map(point => point.frequency))) {
        saved.push({ frequency: boundary.x, gain: boundary.y, text: `{${boundary.x}, ${boundary.y}}` });
    }

    saved.sort((left, right) => left.frequency - right.frequency);
    return saved.map(point => point.text);
}
