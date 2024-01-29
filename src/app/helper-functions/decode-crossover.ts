export function decodeCrossover(val: string): number {
  if (val < '40') return Number(val) * 10;
  else return Number(val);
}
