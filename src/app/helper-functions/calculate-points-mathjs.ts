import {complex, Complex, fft as fourierTransform} from 'mathjs';
import { LinSpacedFracOctaveSmooth } from "./afr-line-smoothing";

function calculatePointsMathJs(responseDataValues: string[], enableSmoothing = true): number[][] {
  if (!responseDataValues || !responseDataValues.length) return [];

  const count = responseDataValues.length;
  let cValues = new Array<Complex>(count);
  let frequencies = new Array<number>(count);
  const sample_rate = 48000;

  for (let j = 0; j < count; j++) {
    cValues[j] = complex(parseFloat(responseDataValues[j]));
    frequencies[j] = j / count * sample_rate;
  }

  cValues = fourierTransform(cValues);
  cValues.length /= 2;
  let points: number[][] = [];
  let x = 0;
  const amplitudeMathJs = ({re, im}: Complex) => Math.sqrt(re * re + im * im);

  if (enableSmoothing) {
    const smoothY = LinSpacedFracOctaveSmooth(cValues.map(value => amplitudeMathJs(value)));

    // filtering
    for (let i = 4; i < smoothY.length; i++) {
      if ((i <= 500 || i % 5 === 0) && (i <= 800 || i % 15 === 0) && (i <= smoothY.length/2 || i % 30 === 0)) { // filtering
        points.push([frequencies[i], 20 * Math.log10(smoothY[i])]);
      }
    }
  }
  else for (let cValue of cValues) {
    points.push([frequencies[x++], 20 * Math.log10(amplitudeMathJs(cValue) as any)]);
  }
  // console.log(points.length, 'points');
  return points;
}
