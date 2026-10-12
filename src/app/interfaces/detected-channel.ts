// Loaded editor model: numeric strings become numbers; supported Auto nulls remain.
export type CustomCrossover = '40' | '60' | '70' | '80' | '90' | '10' | '11' | '12' | '15' | '18' | '20' | '25' | 'F' | 'U';
// Known data states; a receiver need not support every state as a setting.
export type CustomSpeakerType = 'S' | 'L' | 'E' | 'N' | 'Wireless' | 'WirelessStereo';
// None, Small, Large, Exist, Wireless, WirelessStereo (reported enum ordinals).
export type SpeakerConnection = 0 | 1 | 2 | 3 | 4 | 5;

export interface DetectedChannel {
  midrangeCompensation: boolean
  enChannelType: number
  isSkipMeasurement: boolean
  frequencyRangeRolloff: number
  customDistance?: number | null
  customTargetCurvePoints: string[]
  commandId: string
  customSpeakerType?: CustomSpeakerType | null
  delayAdjustment?: number
  flatCurveFilter?: CurveFilter
  referenceCurveFilter?: CurveFilter
  channelReport: ChannelReport
  responseData: ResponseData
  trimAdjustment?: number | string
  customCrossover?: CustomCrossover | null
  customLevel?: number | null
}

export interface CurveFilter {
  Coefficient32kHz?: number[]
  Coefficient441kHz?: number[]
  Coefficient48kHz?: number[]
  DispLargeData?: number[]
  DispSmallData?: number[]
}
export interface ChannelReport {
  enSpeakerConnect?: SpeakerConnection
  customEnSpeakerConnect?: SpeakerConnection
  isReversePolarity: boolean
  distance: number
}

export interface ResponseData {
    // "0": string[]
    // "1": string[]
    // "2": string[]
    // "3": string[]
  [measurement: string]: number[]
}
