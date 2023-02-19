export function isBytesEq(a: Uint8Array, b: Uint8Array): boolean {
  return a.every((v, i) => b[i] === v);
}
