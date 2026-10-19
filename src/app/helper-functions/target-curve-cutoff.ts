import type { DetectedChannel } from '../interfaces/detected-channel';
import { isSubwoofer } from './correction-channel';

// ADY channel indices, including the height and Dolby speaker pairs.
const speakerPairs = [
    [0, 2], [3, 15], [4, 14], [5, 13], [6, 12], [7, 11], [8, 10],
    [18, 40], [19, 39], [20, 38], [21, 37], [22, 36], [23, 35],
    [24, 34], [25, 33], [26, 32], [27, 31], [28, 30],
];
const speakerCutoffs = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250];

function rms(values: number[]): number {
    return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
}

// Approximate model is using the editor's first-position FFT response. It's not the Audyssey's proprietary measurement/cluster preprocessing.
export function estimateTargetCutoff(points: number[][], subwoofer: boolean): number {
    const valid = points.filter(([frequency, gain]) => frequency > 0 && Number.isFinite(gain));
    const reference = valid.filter(([frequency]) => subwoofer
        ? frequency >= 46.875 && frequency <= 64.453125
        : frequency >= 500 && frequency <= 2000);
    const fitting = valid.filter(([frequency]) => frequency >= 11.7 && frequency <= 180);
    if (!reference.length || fitting.length < 3) return 0;

    const referenceGain = 20 * Math.log10(rms(reference.map(([, gain]) => 10 ** (gain / 20))));
    if (!Number.isFinite(referenceGain)) return 0;
    let bestScore = Infinity;
    let cutoff = 0;
    for (let order = 2; order <= 6; order++) {
        for (const candidate of subwoofer ? speakerCutoffs.slice(0, 4) : speakerCutoffs) {
            const magnitude = (frequency: number) => 1 / Math.sqrt(1 + (candidate / frequency) ** (2 * order));
            const normalization = subwoofer
                ? 20 * Math.log10(rms(reference.map(([frequency]) => magnitude(frequency)))) : 0;
            const score = fitting.reduce((sum, [frequency, gain]) =>
                sum + Math.abs(referenceGain + 20 * Math.log10(magnitude(frequency)) - normalization - gain), 0) / fitting.length;
            if (score < bestScore) {
                bestScore = score;
                cutoff = candidate;
            }
        }
    }
    return cutoff;
}

export function estimateTargetCutoffs(channels: DetectedChannel[], measurements: Map<number, number[][]>): Map<number, number> {
    const cutoffs = new Map(channels.map(channel => [channel.enChannelType,
        estimateTargetCutoff(measurements.get(channel.enChannelType) ?? [], isSubwoofer(channel))]));
    for (const [left, right] of speakerPairs) {
        // Missing measurements cannot establish a cutoff for that output.
        if (cutoffs.get(left) && cutoffs.get(right)) {
            const cutoff = Math.max(cutoffs.get(left)!, cutoffs.get(right)!);
            cutoffs.set(left, cutoff);
            cutoffs.set(right, cutoff);
        }
    }
    return cutoffs;
}

// The target uses order 2 even when a higher order won the cutoff fit.
export function getTargetRolloff(frequency: number, cutoff = 0): number {
    return cutoff >= 40 ? -10 * Math.log10(1 + (cutoff / frequency) ** 4) : 0;
}
