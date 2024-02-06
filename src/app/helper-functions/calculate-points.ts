import {abs as magnitude, complex, Complex, fft} from "mathjs";

export function calculatePoints(responseDataValues: string[], enableSmoothing = true): number[][] {
  if (!responseDataValues || !responseDataValues.length) return [];

  let count = responseDataValues.length;
  let cValues: Complex[] = new Array(count);
  let Xs: number[] = new Array(count);

  const sample_rate = 48000;

  for (let j = 0; j < count; j++) {
    cValues[j] = complex(parseFloat(responseDataValues[j]))
    Xs[j] = j / count * sample_rate;
  }

  cValues = fft(cValues);

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

  const filteredPoints =  points.filter(function(_, i) {
    if (i > 2500) return (i % 60 === 0);
    if (i > 1500) return (i % 25 === 0);
    if (i > 1000) return (i % 20 === 0);
    if (i > 800) return (i % 15 === 0);
    if (i > 500) return (i % 5 === 0);
    return i >= 4; // remove everything less than 10Hz
  });

  console.log('points', points.length);
  console.log('filteredPoints', filteredPoints.length);

  return filteredPoints;
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
  const N = smoothed.length;
  let xp, yp;
  // Smooth from HF to LF to avoid artificial elevation of HF data
  for (let pass = 0; pass < passes; pass++) {
    xp = smoothed[N - 1];
    yp = xp;
    // reverse pass
    for (let i = N - 2; i >= 0; i--) {
      const a = 1 / (b + i * bwFactor);
      yp += ((xp + smoothed[i]) / 2 - yp) * a;
      xp = smoothed[i];
      smoothed[i] = yp;
    }
    // forward pass
    for (let i = 1; i < N; i++) {
      const a = 1 / (b + i * bwFactor);
      yp += ((xp + smoothed[i]) / 2 - yp) * a;
      xp = smoothed[i];
      smoothed[i] = yp;
    }
  }

  return [...origArr.slice(0, smoothStart),...smoothed];
}
