import {DetectedChannel} from "./detected-channel";

export interface AudysseyInterface {
    adcLineup?: number
    ampAssignInfo?: string
    auro?: boolean
    detectedChannels: DetectedChannel[]
    dynamicEq?: boolean
    dynamicVolume?: boolean
    enAmpAssignType?: number
    enMultEQType?: number
    enTargetCurveType?: 1 | 2
    interfaceVersion?: string
    lfc?: boolean
    lfcSupport?: boolean
    subwooferLayout?: string; // "N/A"
    subwooferMode?: "Standard" | "Custom"
    subwooferNum?: string; // "3"
    systemDelay?: number
    targetModelName?: string
    title?: string
    upgradeInfo?: string
}
