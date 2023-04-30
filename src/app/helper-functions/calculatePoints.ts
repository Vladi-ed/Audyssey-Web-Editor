import {abs as magnitude, complex, Complex, fft} from "mathjs";
import {LinSpacedFracOctaveSmooth} from "./smooth";

export function calculatePoints(responseDataValues?: string[], enableSmoothing = true) {
  if (!responseDataValues || !responseDataValues.length) return [];

  let count = responseDataValues.length;
  let cValues: Complex[] = new Array(count);
  let Xs: number[] = new Array(count);

  const sample_rate = 48000;

  for (let j = 0; j < count; j++) {
    cValues[j] = complex(parseFloat(responseDataValues[j]))
    Xs[j] = j / count * sample_rate;
  }

  console.log('cValues', cValues);

  cValues = fft(cValues);
  console.log('cValuesFFT', cValues);
  console.log('magnitude', magnitude(cValues[0]));

  let points: number[][] = [];
  let x = 0;

  if (enableSmoothing) {

    let smoothed = new Array(count);
    for (let j = 0; j < count; j++) {
      smoothed[j] = magnitude(cValues[j]);
    }

    smoothed = LinSpacedFracOctaveSmooth(smoothed);

    for (let smoothedResult of smoothed) {
      points.push([Xs[x++], 20 * Math.log10(smoothedResult) ]);
      if (x == count / 2) break;
    }

  }
  else for (let cValue of cValues) {
    points.push([Xs[x++], 20 * Math.log10(magnitude(cValue) as unknown as number)]);
    if (x == count / 2) break;
  }

  return points;
}
