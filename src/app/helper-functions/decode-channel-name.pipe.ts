import { Pipe, PipeTransform } from '@angular/core';

const CHANNEL_NAMES: Record<string, string> = {
    'C': 'Center',
    'FL': 'Front Left',
    'FR': 'Front Right',
    'SL': 'Surround Left',
    'SR': 'Surround Right',
    'SLA': 'Surround Left',
    'SRA': 'Surround Right',
    'FHL': 'Front Height L',
    'FHR': 'Front Height R',
    'RHL': 'Rear Height L',
    'RHR': 'Rear Height R',
    'BDL': 'Back Dolby Left',
    'BDR': 'Back Dolby Right',
    'CH': 'Center Height',
    'FDL': 'Front Dolby Left',
    'FDR': 'Front Dolby Right',
    'FWL': 'Front Wide Left',
    'FWR': 'Front Wide Right',
    'SBL': 'Surround Back L',
    'SBR': 'Surround Back R',
    'SDL': 'Surround Dolby L',
    'SDR': 'Surround Dolby R',
    'SHL': 'Surround Height L',
    'SHR': 'Surround Height R',
    'TFL': 'Top Front Left',
    'TFR': 'Top Front Right',
    'TML': 'Top Middle Left',
    'TMR': 'Top Middle Right',
    'TRL': 'Top Rear Left',
    'TRR': 'Top Rear Right',
    'TS': 'Top Surround',
    'SW1': 'Subwoofer',
    'SW2': 'Subwoofer 2',
    'SW3': 'Subwoofer 3',
    'SW4': 'Subwoofer 4',
    'SWMIX': 'Subwoofer Group',
    'SWMIX1': 'Subwoofer Mix 1',
    'SWMIX2': 'Subwoofer Mix 2',
    'SWMIX3': 'Subwoofer Mix 3',
    'SWMIX4': 'Subwoofer Mix 4',
};

@Pipe({ name: 'decodeChannelName', standalone: true })
export class DecodeChannelNamePipe implements PipeTransform {
    transform(value: string): string {
        return decodeChannelName(value);
    }
}

export function decodeChannelName(commandId?: string) {
    return (commandId && CHANNEL_NAMES[commandId.toUpperCase()]) || commandId || '';
}
