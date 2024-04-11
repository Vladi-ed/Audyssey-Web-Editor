import FFT from 'fft.js'
import { LinSpacedFracOctaveSmooth } from "./afr-line-smoothing";

export function calculatePoints(responseData: string[]) {
  if (!responseData || !responseData.length) return [];

  const count = responseData.length;

  let cValues = new Array(count);
  let frequencies = new Array<number>(count);
  const sample_rate = 48000;

  for (let j = 0; j < count; j++) {
    cValues[j] = parseFloat(responseData[j]);
    frequencies[j] = j / count * sample_rate;
  }

  const fft = new FFT(count);
  const out = fft.createComplexArray();
  fft.realTransform(out, cValues);

  let points: number[] = [];
  const amplitude = (re: number, im: number) => Math.sqrt(re * re + im * im);

  // no smoothing
  // for (let cValue of out) {
  //   points.push([frequencies[x++], 20 * Math.log10(amplitude(cValue))]);
  // }

  for (let i = 0; i < out.length/2 - 2; i += 2) {
    points.push(amplitude(out[i], out[i + 1]));
  }

  const smoothY = LinSpacedFracOctaveSmooth(points);
  const pointsSmooth: number[][] = [];

  // filtering
  for (let i = 4; i < smoothY.length; i++) {
    if ((i <= 500 || i % 5 === 0) && (i <= 800 || i % 15 === 0) && (i <= smoothY.length/2 || i % 30 === 0)) {
      pointsSmooth.push([frequencies[i], 20 * Math.log10(smoothY[i])]);
    }
  }

  console.log(points.length, 'points');
  // console.log('fft points', pointsSmooth);

  return pointsSmooth;
}

