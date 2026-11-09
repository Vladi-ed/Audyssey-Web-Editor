import FFT from 'fft.js';
import { LinSpacedFracOctaveSmooth } from './afr-line-smoothing';
import type { ResponseData } from '../interfaces/detected-channel';

export type AverageAlgorithm = 'rms' | 'db' | 'linear';

export interface ChannelGraphData {
    first: number[][];
    average: Record<AverageAlgorithm, number[][]>;
    measurementCount: number;
}

const sampleRate = 48000;
const fftCache = new Map<number, FFT>();

function getFft(size: number): FFT {
    let fft = fftCache.get(size);
    if (!fft) {
        fft = new FFT(size);
        fftCache.set(size, fft);
    }
    return fft;
}

function formatSmoothedPoints(amplitudes: number[], count: number): number[][] {
    const smoothY = LinSpacedFracOctaveSmooth(amplitudes);
    const pointsSmooth: number[][] = [];

    // filtering
    for (let i = 4; i < smoothY.length; i++) {
        if ((i <= 500 || i % 5 === 0) && (i <= 800 || i % 15 === 0) && (i <= smoothY.length / 2 || i % 30 === 0)) {
            const frequency = (i / count) * sampleRate;
            pointsSmooth.push([frequency, 20 * Math.log10(smoothY[i])]);
        }
    }

    return pointsSmooth;
}

export function calculatePoints(responseData: number[]): number[][] {
    if (!responseData || responseData.length <= 1 || (responseData.length & (responseData.length - 1)) !== 0) {
        return [];
    }

    const count = responseData.length;
    const fft = getFft(count);
    const out = fft.createComplexArray();
    fft.realTransform(out, responseData);

    const points: number[] = [];
    for (let i = 0; i < out.length / 2 - 2; i += 2) {
        points.push(Math.hypot(out[i], out[i + 1]));
    }

    return formatSmoothedPoints(points, count);
}

export function calculateChannelGraphData(responseData?: ResponseData): ChannelGraphData {
    const empty: ChannelGraphData = {
        first: [],
        average: { rms: [], db: [], linear: [] },
        measurementCount: 0,
    };
    if (!responseData) return empty;

    const measurements = Object.entries(responseData)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([, samples]) => samples)
        .filter(samples => samples.length > 1 && (samples.length & (samples.length - 1)) === 0);

    if (measurements.length === 0) return empty;

    const firstSamples = measurements[0];
    const count = firstSamples.length;
    const compatibleMeasurements = measurements.filter(samples => samples.length === count);
    const measurementCount = compatibleMeasurements.length;

    const fft = getFft(count);
    const out = fft.createComplexArray();
    fft.realTransform(out, firstSamples);

    const binCount = count / 2 - 1;
    const firstAmplitudes = new Array<number>(binCount);
    const powerSum = new Float64Array(binCount);
    const linearSum = new Float64Array(binCount);

    for (let b = 0; b < binCount; b++) {
        const re = out[b * 2];
        const im = out[b * 2 + 1];
        const power = re * re + im * im;
        const amplitude = Math.sqrt(power);
        firstAmplitudes[b] = amplitude;
        powerSum[b] = power;
        linearSum[b] = amplitude;
    }

    const first = formatSmoothedPoints(firstAmplitudes, count);

    if (measurementCount === 1) {
        return {
            first,
            average: { rms: first, db: first, linear: first },
            measurementCount: 1,
        };
    }

    const dbSums = first.map(([, db]) => db);
    const amplitudes = new Array<number>(binCount);

    for (let m = 1; m < measurementCount; m++) {
        fft.realTransform(out, compatibleMeasurements[m]);
        for (let b = 0; b < binCount; b++) {
            const re = out[b * 2];
            const im = out[b * 2 + 1];
            const power = re * re + im * im;
            const amplitude = Math.sqrt(power);
            amplitudes[b] = amplitude;
            powerSum[b] += power;
            linearSum[b] += amplitude;
        }
        const points = formatSmoothedPoints(amplitudes, count);
        for (let p = 0; p < points.length; p++) {
            dbSums[p] += points[p][1];
        }
    }

    const rmsAmplitudes = new Array<number>(binCount);
    const linearAmplitudes = new Array<number>(binCount);
    for (let b = 0; b < binCount; b++) {
        rmsAmplitudes[b] = Math.sqrt(powerSum[b] / measurementCount);
        linearAmplitudes[b] = linearSum[b] / measurementCount;
    }

    return {
        first,
        average: {
            rms: formatSmoothedPoints(rmsAmplitudes, count),
            db: first.map(([frequency], p) => [frequency, dbSums[p] / measurementCount]),
            linear: formatSmoothedPoints(linearAmplitudes, count),
        },
        measurementCount,
    };
}

