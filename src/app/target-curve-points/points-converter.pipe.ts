import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'convertPoints', standalone: true })
export class PointsConverterPipe implements PipeTransform {

  transform(inputArr: string[]): { Hz: string, vol: number | null }[] {
    return inputArr.map(item => {
      const [Hz, vol] = item.substring(1, item.length - 1).split(',');
      return { Hz, vol: vol?.trim() ? Number(vol) : null };
    }) || [];
  }
}
