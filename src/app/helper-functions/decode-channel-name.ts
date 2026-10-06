import { CHANNEL_TYPE_NAMES } from './channel-type-names';

// Compatibility fallback for command-only callers and unknown ADY channel types.
const CHANNEL_NAMES: Record<string, string> = {
    'C': 'Center',
    'FL': 'Front Left',
    'FR': 'Front Right',
    'SL': 'Surround Left',
    'SR': 'Surround Right',
    'SLA': 'Surround Left',
    'SRA': 'Surround Right',
    'SLB': 'Surround Left B',
    'SRB': 'Surround Right B',
    'FHL': 'Front Height L',
    'FHR': 'Front Height R',
    'RHL': 'Rear Height L',
    'RHR': 'Rear Height R',
    'CH': 'Center Height',
    'BDL': 'Dolby Back Left',
    'BDR': 'Dolby Back Right',
    'FDL': 'Dolby Front Left',
    'FDR': 'Dolby Front Right',
    'SDL': 'Dolby Surround L',
    'SDR': 'Dolby Surround R',
    'FWL': 'Front Wide Left',
    'FWR': 'Front Wide Right',
    'SBL': 'Surround Back L',
    'SBR': 'Surround Back R',
    'SHL': 'Surround Height L',
    'SHR': 'Surround Height R',
    'TFL': 'Top Front Left',
    'TFR': 'Top Front Right',
    'TML': 'Top Middle Left',
    'TMR': 'Top Middle Right',
    'TRL': 'Top Rear Left',
    'TRR': 'Top Rear Right',
    'TS': 'Top Surround',
    // enChannelType 54-57 means SWMix1-4; their normal commandIds are SW1-4.
    // SWMix1 owns the shared measurements/target and Flat/Reference filters;
    // SWMix2-4 share its filters but retain per-output trim/delay settings.
    // Directional subs use positional channel types and separate processing.
    'SW1': 'Subwoofer',
    'SW2': 'Subwoofer 2',
    'SW3': 'Subwoofer 3',
    'SW4': 'Subwoofer 4',
    // Measurement commands have different semantics: SWMIX combines two subs,
    // SWMIX3/4 combine three/four. Their suffix is a count in that context,
    // whereas internal SWMix1-4 indices refer to output entries. Resolve groups
    // using enChannelType and setup metadata, never these labels alone.
    // Group ownership is resolved in correction-channel.ts, outside this label
    // dictionary. See docs/multeq-subwoofer-groups.md for the recovered behavior.
    'SWMIX': 'Subwoofer Group',
    'SWMIX1': 'Subwoofer Mix 1',
    'SWMIX2': 'Subwoofer Mix 2',
    'SWMIX3': 'Subwoofer Mix 3',
    'SWMIX4': 'Subwoofer Mix 4',
};

export function decodeChannelName(commandId?: string, enChannelType?: number): string {
    // SBL also means back center; SW1 is reused for several subwoofer layouts.
    // Prefer the ADY channel index whenever the recovered mapping recognizes it.
    const typeName = enChannelType === undefined ? undefined : CHANNEL_TYPE_NAMES[enChannelType];
    if (typeName !== undefined) return typeName;
    return (commandId && CHANNEL_NAMES[commandId.toUpperCase()]) || commandId || '';
}
