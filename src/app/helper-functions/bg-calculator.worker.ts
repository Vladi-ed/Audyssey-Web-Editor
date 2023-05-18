/// <reference lib="webworker" />
import {calculatePoints} from "./calculate-points";
import {DetectedChannel} from "../interfaces/detected-channel";

addEventListener('message', ({ data }) => {
  console.time("Calculate AllChannels in background");

  const response = new Map((data as DetectedChannel[]).map(channel => [channel.commandId, calculatePoints(channel.responseData[0])]));

  console.timeEnd("Calculate AllChannels in background");
  postMessage(response);
});
