export function LinSpacedFracOctaveSmooth(origArr: any[], frac = 24, smoothStart = 50, startFreq = 1, freqStep = 1 / 48) {
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
