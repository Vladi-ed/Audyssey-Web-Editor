/// <reference lib="webworker" />
import { calculatePoints } from './calculate-points';
import { DetectedChannel } from '../interfaces/detected-channel';
import { getCorrectionChannels } from './correction-channel';

addEventListener('message', ({ data }: MessageEvent<{ channels: DetectedChannel[]; subwooferMode?: string }>) => {
  console.time("Calculate AllChannels in background");

  // const response = new Map((data as DetectedChannel[]).map(channel => [channel.commandId, calculatePoints(channel.responseData[0])]));

  const map  = new Map<number, number[][]>();

  getCorrectionChannels(data.channels, data.subwooferMode).forEach((channel: DetectedChannel) => {
    // console.log('channel', channel.commandId);
    const firstMeasurement = 0;
    map.set(channel.enChannelType, calculatePoints(channel.responseData?.[firstMeasurement]));
  });

  console.timeEnd("Calculate AllChannels in background");
  postMessage(map);
});
