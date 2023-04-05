import {ReferenceCurveFilter} from "./reference-curve-filter";
import {ChannelReport} from "./channel-report";
import {FlatCurveFilter} from "./flat-curve-filter";
import {ResponseData} from "./response-data";

export interface DetectedChannel {
  midrangeCompensation: boolean
  enChannelType: number
  isSkipMeasurement: boolean
  frequencyRangeRolloff: number
  customDistance: number
  customTargetCurvePoints: string[]
  commandId: string
  customSpeakerType?: string
  delayAdjustment: string
  referenceCurveFilter: ReferenceCurveFilter
  channelReport: ChannelReport
  responseData: ResponseData
  flatCurveFilter: FlatCurveFilter
  trimAdjustment: string
  customCrossover?: string
  customLevel?: number
}
