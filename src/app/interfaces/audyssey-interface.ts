import {DetectedChannel} from "./detected-channel";

export interface AudysseyInterface {
  enAmpAssignType?: number
  dynamicVolume?: boolean
  enTargetCurveType?: number
  lfcSupport?: boolean
  detectedChannels: DetectedChannel[]
  targetModelName?: string
  title?: string
  interfaceVersion?: string
  dynamicEq?: boolean
  ampAssignInfo?: string
  lfc?: boolean
  systemDelay?: number
  auro?: boolean
  upgradeInfo?: string
  enMultEQType?: number
  adcLineup?: number
}
