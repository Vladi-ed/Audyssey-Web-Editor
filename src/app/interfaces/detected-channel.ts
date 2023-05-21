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
  flatCurveFilter: CurveFilter
  referenceCurveFilter: CurveFilter
  channelReport: ChannelReport
  responseData: ResponseData
  trimAdjustment: string
  customCrossover?: string
  customLevel?: number
}

export interface CurveFilter {
  coefficient32kHz: number[]
  coefficient441kHz: number[]
  coefficient48kHz: number[]
  dispLargeData: number[]
  dispSmallData: number[]
}
export interface ChannelReport {
  enSpeakerConnect: number
  customEnSpeakerConnect: number
  isReversePolarity: boolean
  distance: number
}
export interface ResponseData {
  "0": string[]
  "1": string[]
  "2": string[]
  "3": string[]
}
