export function isBytesEq(a: Uint8Array, b: Uint8Array): boolean {
  return a.every((v, i) => b[i] === v);
}

export function brandedUint8ArrayFactory<T extends Uint8Array>(
  name: string,
  size: number,
) {
  return {
    fromBytes(buf: Uint8Array): T {
      if (buf.length !== size) {
        throw new RangeError(
          `${name}.fromBytes: input buffer must be ${size} bytes in length, got: ${buf.length}`,
        );
      }

      return buf as T;
    },
    get requiredLength(): number {
      return size;
    },
  };
}
