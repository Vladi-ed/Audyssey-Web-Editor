import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'convertPoints' })
export class PointsConverterPipe implements PipeTransform {

  transform(inputArr: string[]): { Hz: string, vol: number }[] {
    if (inputArr.length > 100) {
      alert('There are ' + inputArr.length + ' points. Showing first 100');
      inputArr.length = 100;
    }

    return inputArr.map(item => {
      const [Hz, vol] = item.substring(1, item.length - 1).split(',');
      return { Hz, vol: Number(vol) };
    }) || [];
  }
}
