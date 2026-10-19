import type { CustomCrossover, CustomSpeakerType, DetectedChannel } from '../interfaces/detected-channel';

export const channelSettingsLimits = {
    frequency: { min: 20, max: 20000 },
    distance: { min: 0, max: 18 },
    level: { min: -12, max: 12 },
} as const;

// Empty numeric controls use null; optional overrides can store that Auto state.
export interface ChannelSettingsValue {
    frequencyRangeRolloff: number | null;
    customDistance: number | null;
    customLevel: number | null;
    customCrossover: CustomCrossover | '';
    customSpeakerType: CustomSpeakerType | '';
    midrangeCompensation: boolean;
    isReversePolarity: boolean;
}

export function normalizeCorrectionLimit(value: unknown): number {
    const numeric = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
    const { min, max } = channelSettingsLimits.frequency;
    // Android resets an out-of-range limit to 20 kHz; also recover old editor nulls.
    return Number.isFinite(numeric) && numeric >= min && numeric <= max ? numeric : max;
}

export function readChannelSettings(channel: DetectedChannel, curve?: DetectedChannel): ChannelSettingsValue {
    return {
        frequencyRangeRolloff: curve ? normalizeCorrectionLimit(curve.frequencyRangeRolloff) : null,
        customDistance: channel.customDistance ?? null,
        customLevel: channel.customLevel ?? null,
        customCrossover: channel.customCrossover ?? '',
        customSpeakerType: channel.customSpeakerType ?? '',
        midrangeCompensation: channel.midrangeCompensation ?? false,
        isReversePolarity: channel.channelReport.isReversePolarity ?? false,
    };
}

export function writeChannelSettings(value: ChannelSettingsValue, channel: DetectedChannel, curve?: DetectedChannel) {
    const previous = readChannelSettings(channel, curve);
    const inRange = (numeric: number | null, limits: { min: number; max: number }) =>
        numeric !== null && Number.isFinite(numeric) && numeric >= limits.min && numeric <= limits.max;
    const limitChanged = !!curve && inRange(value.frequencyRangeRolloff, channelSettingsLimits.frequency)
        && value.frequencyRangeRolloff !== previous.frequencyRangeRolloff;
    const crossoverChanged = value.customCrossover !== previous.customCrossover;
    const speakerTypeChanged = value.customSpeakerType !== previous.customSpeakerType;
    const midrangeChanged = value.midrangeCompensation !== previous.midrangeCompensation;

    // Keep numbers and Android-supported Auto nulls without serialization conversion.
    if (limitChanged) curve!.frequencyRangeRolloff = value.frequencyRangeRolloff!;
    if (value.customDistance !== previous.customDistance && (value.customDistance === null
        || inRange(value.customDistance, channelSettingsLimits.distance))) {
        channel.customDistance = value.customDistance;
    }
    if (value.customLevel !== previous.customLevel && (value.customLevel === null
        || (inRange(value.customLevel, channelSettingsLimits.level) && Number.isInteger(value.customLevel * 2)))) {
        channel.customLevel = value.customLevel;
    }
    if (crossoverChanged) {
        if (value.customCrossover) channel.customCrossover = value.customCrossover;
        else delete channel.customCrossover;
    }
    if (speakerTypeChanged) {
        if (value.customSpeakerType) channel.customSpeakerType = value.customSpeakerType;
        else delete channel.customSpeakerType;
    }
    if (midrangeChanged) channel.midrangeCompensation = value.midrangeCompensation;
    if (value.isReversePolarity !== previous.isReversePolarity) channel.channelReport.isReversePolarity = value.isReversePolarity;

    return { chartChanged: limitChanged || crossoverChanged || speakerTypeChanged, midrangeChanged };
}
