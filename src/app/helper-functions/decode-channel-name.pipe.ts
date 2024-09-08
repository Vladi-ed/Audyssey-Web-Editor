import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decodeChannelName', standalone: true })
export class DecodeChannelNamePipe implements PipeTransform {

  transform(value: string): string {
    return decodeChannelName(value);
  }
}

export function decodeChannelName(commandId?: string) {
  switch (commandId) {
    case 'C' : return 'Center';
    case 'FL' : return 'Front Left';
    case 'FR' : return 'Front Right';
    case 'SLA' : return 'Surround Left';
    case 'SRA' : return 'Surround Right';
    case 'FHL' : return 'Front Height Left';
    case 'FHR' : return 'Front Height Right';
    case 'RHL' : return 'Rear Height Left';
    case 'RHR' : return 'Rear Height Right';
    case 'BDL' : return 'Back Dolby Left';
    case 'CH' : return 'Center Height';
    case 'FDL' : return 'Front Dolby Left';
    case 'FWL' : return 'Front Wide Left';
    case 'SBL' : return 'Surround Back Left';
    case 'SDL' : return 'Surround Dolby Left';
    case 'SHL' : return 'Surround Height Left';
    case 'TFL' : return 'Top Front Left';
    case 'TML' : return 'Top Middle Left';
    case 'TRL' : return 'Top Rear Left';
    case 'TS' : return 'Top Surround';
    case 'SW1' : return 'Subwoofer';
    case 'SW2' : return 'Subwoofer 2';
    case 'SWMIX' : return 'Subwoofer Mix';
    default: return commandId || '';
  }
}
