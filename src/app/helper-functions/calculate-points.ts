import {abs as magnitude, complex, Complex, fft as fourierTransform} from 'mathjs';

export function calculatePoints(responseDataValues: string[], enableSmoothing = true): number[][] {
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

  if (enableSmoothing) {
    const smoothY = LinSpacedFracOctaveSmooth(cValues.map(value => magnitude(value)));

    for (let i = 4; i < smoothY.length; i++) {
      if ((i <= 500 || i % 5 === 0) && (i <= 800 || i % 15 === 0) && (i <= smoothY.length/2 || i % 30 === 0)) { // filtering
        points.push([frequencies[i], 20 * Math.log10(smoothY[i])]);
      }
    }
  }
  else for (let cValue of cValues) {
    points.push([frequencies[x++], 20 * Math.log10(magnitude(cValue) as any)]);
  }
  console.log(points.length, 'points');
  return points;
}


function LinSpacedFracOctaveSmooth(origArr: any[], frac = 24, smoothStart = 50, startFreq = 1, freqStep = 1 / 48) {
// function LinSpacedFracOctaveSmooth(origArr: any[], frac = 16, smoothStart = 40, startFreq = 1, freqStep = 1 / 48) {
  const smoothed = origArr.slice(smoothStart);
  const passes = 8;
  // Scale octave frac to allow for number of passes
  const scaledFrac = 7.5 * frac; // Empirical tweak to better match Gaussian smoothing
  const octMult = Math.pow(2, 0.5 / scaledFrac);
  const bwFactor = octMult - 1 / octMult;
  const b = 0.5 + bwFactor * startFreq / freqStep;
  const arrLength = smoothed.length;
  let xPoint, yp;
  // Smooth from HF to LF to avoid artificial elevation of HF data
  for (let pass = 0; pass < passes; pass++) {
    xPoint = smoothed[arrLength - 1];
    yp = xPoint;
    // reverse pass
    for (let i = arrLength - 2; i >= 0; i--) {
      const a = 1 / (b + i * bwFactor);
      yp += ((xPoint + smoothed[i]) / 2 - yp) * a;
      xPoint = smoothed[i];
      smoothed[i] = yp;
    }
    // forward pass
    for (let i = 1; i < arrLength; i++) {
      const a = 1 / (b + i * bwFactor);
      yp += ((xPoint + smoothed[i]) / 2 - yp) * a;
      xPoint = smoothed[i];
      smoothed[i] = yp;
    }
  }

  return [...origArr.slice(0, smoothStart), ...smoothed];
}
