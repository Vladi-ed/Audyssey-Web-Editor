/// <reference lib="webworker" />
import {calculatePoints} from "./calculate-points";
import {DetectedChannel} from "../interfaces/detected-channel";

addEventListener('message', ({ data }) => {
  console.time("Calculate AllChannels in background");

  // const response = new Map((data as DetectedChannel[]).map(channel => [channel.commandId, calculatePoints(channel.responseData[0])]));

  const map  = new Map<number, number[][]>();

  data.forEach((channel: DetectedChannel) => {
    // console.log('channel', channel.commandId);
    const firstMeasurement = 0;
    map.set(channel.enChannelType, calculatePoints(channel.responseData[firstMeasurement]));
  });

  console.timeEnd("Calculate AllChannels in background");
  postMessage(map);
});
