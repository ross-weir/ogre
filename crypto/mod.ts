function brandedUint8ArrayFactory<T extends Uint8Array>(
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
  };
}

/** Digest that is 32 bytes in size */
export type Digest32 = Uint8Array & { readonly __brand: unique symbol };
export const digest32 = brandedUint8ArrayFactory<Digest32>("digest32", 32);

/**
 * AdDigest is 33 bytes in size
 * An extra byte included for tree height
 */
export type AdDigest = Uint8Array & { readonly __brand: unique symbol };
export const adDigest = brandedUint8ArrayFactory<AdDigest>("adDigest", 33);
