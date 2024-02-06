import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decodeChannelName' })
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
    case 'SW1' : return 'Subwoofer';
    case 'SW2' : return 'Subwoofer 2';
    case 'SWMIX' : return 'Subwoofer Mix';
    default: return commandId || '';
  }
}
