import type { DetectedChannel } from '../interfaces/detected-channel';
import { normalizeCorrectionLimit } from './channel-settings';

function numericValue(value: unknown): number | undefined {
    if (typeof value !== 'number' && typeof value !== 'string') return undefined;
    if (typeof value === 'string' && !value.trim()) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
}

function numericArray(value: unknown, property: string): number[] {
    if (!Array.isArray(value)) throw new Error(`Invalid .ady file: ${property} must be an array.`);
    return value.map((sample, index) => {
        const numeric = numericValue(sample);
        if (numeric === undefined) throw new Error(`Invalid .ady file: ${property}[${index}] must be a finite number.`);
        return numeric;
    });
}

// Called before charts/forms receive data. The TypeScript interface describes the
// normalized model; raw JSON can still contain numeric strings/nulls.
export function normalizeAdyChannels(channels: DetectedChannel[]): void {
    for (const channel of channels) {
        channel.frequencyRangeRolloff = normalizeCorrectionLimit(channel.frequencyRangeRolloff);
        for (const property of ['customDistance', 'customLevel', 'delayAdjustment', 'trimAdjustment'] as const) {
            const raw: unknown = channel[property];
            // accepts explicit Auto nulls for these overrides.
            if (raw === null && (property === 'customDistance' || property === 'customLevel')) continue;
            const numeric = numericValue(raw);
            if (numeric === undefined && raw != null && !(typeof raw === 'string' && !raw.trim())) {
                throw new Error(`Invalid .ady file: ${property} must be a finite number.`);
            }
            if (numeric === undefined) delete channel[property];
            else channel[property] = numeric;
        }
        for (const property of ['customCrossover', 'customSpeakerType'] as const) {
            const raw: unknown = channel[property];
            if (raw === undefined || raw === '') delete channel[property];
        }

        // creates defaults for absent report and target-point properties.
        channel.channelReport ??= { isReversePolarity: false, distance: 0 };
        channel.channelReport.distance = numericValue(channel.channelReport.distance) ?? 0;
        for (const property of ['enSpeakerConnect', 'customEnSpeakerConnect'] as const) {
            if (channel.channelReport[property] == null) delete channel.channelReport[property];
        }
        channel.customTargetCurvePoints ??= [];
        channel.responseData ??= {};
        for (const [measurement, samples] of Object.entries(channel.responseData)) {
            channel.responseData[measurement] = numericArray(samples, `responseData.${measurement}`);
        }
        for (const property of ['flatCurveFilter', 'referenceCurveFilter'] as const) {
            const filter = channel[property];
            if (filter == null) {
                delete channel[property];
                continue;
            }
            for (const key of ['Coefficient32kHz', 'Coefficient441kHz', 'Coefficient48kHz', 'DispLargeData', 'DispSmallData'] as const) {
                if (filter[key] == null) delete filter[key];
                else filter[key] = numericArray(filter[key], `${property}.${key}`);
            }
        }
    }
}
