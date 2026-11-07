/// <reference lib="webworker" />
import { calculateChannelGraphData, ChannelGraphData } from './calculate-points';
import { DetectedChannel } from '../interfaces/detected-channel';
import { getCorrectionChannels } from './correction-channel';

addEventListener('message', ({ data }: MessageEvent<{ channels: DetectedChannel[]; subwooferMode?: string }>) => {
    console.time('Calculate AllChannels in background');

    const map = new Map<number, ChannelGraphData>();

    getCorrectionChannels(data.channels, data.subwooferMode).forEach((channel: DetectedChannel) => {
        map.set(channel.enChannelType, calculateChannelGraphData(channel.responseData));
    });

    console.timeEnd('Calculate AllChannels in background');
    postMessage(map);
});
