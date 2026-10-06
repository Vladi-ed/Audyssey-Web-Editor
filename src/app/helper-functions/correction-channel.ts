import type { DetectedChannel } from '../interfaces/detected-channel';

// ADY channel indices, not enum ordinals or receiver output names.
export function isSharedSubwoofer(channel: DetectedChannel, mode?: string): boolean {
    return mode?.toLowerCase() !== 'directional' && channel.enChannelType >= 54 && channel.enChannelType <= 57;
}

export function resolveCorrectionChannel(channel: DetectedChannel | undefined, channels: DetectedChannel[], mode?: string): DetectedChannel | undefined {
    if (!channel || !isSharedSubwoofer(channel, mode) || channel.enChannelType === 54) return channel;
    return channels.find(candidate => candidate.enChannelType === 54);
}

export function getCorrectionChannels(channels: DetectedChannel[], mode?: string): DetectedChannel[] {
    // Keep orphan outputs selectable so their settings remain accessible.
    const hasLeader = channels.some(channel => isSharedSubwoofer(channel, mode) && channel.enChannelType === 54);
    return channels.filter(channel => !hasLeader || !isSharedSubwoofer(channel, mode) || channel.enChannelType === 54);
}

export function getSharedSubwooferOutputs(channel: DetectedChannel | undefined, channels: DetectedChannel[], mode?: string): DetectedChannel[] {
    if (!channel || !isSharedSubwoofer(channel, mode) || !resolveCorrectionChannel(channel, channels, mode)) return [];
    return channels.filter(candidate => isSharedSubwoofer(candidate, mode)).sort((a, b) => a.enChannelType - b.enChannelType);
}
