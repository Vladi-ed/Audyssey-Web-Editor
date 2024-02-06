import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decodeEqType' })
export class DecodeEqTypePipe implements PipeTransform {

  transform(value: number | undefined): string {
    if (value == 0) return 'MultiEQ';
    if (value == 1) return 'MultiEQ XT';
    if (value == 2) return 'MultiEQ XT32';
    else return '';
  }
}
