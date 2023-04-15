/** Digest that is 32 bytes in size */
export type Digest32 = Uint8Array & { readonly __brand: unique symbol };

export function newDigest32(buf: Uint8Array): Digest32 {
  if (buf.length !== 32) {
    throw new RangeError(
      `newDigest32: input buffer must be 32 bytes in length, got: ${buf.length}`,
    );
  }

  return buf as Digest32;
}

/**
 * AdDigest is 33 bytes in size
 * An extra byte included for tree height
 */
export type AdDigest = Uint8Array & { readonly __brand: unique symbol };

export function newAdDigest(buf: Uint8Array): AdDigest {
  if (buf.length !== 33) {
    throw new RangeError(
      `newAdDigest: input buffer must be 33 bytes in length, got: ${buf.length}`,
    );
  }

  return buf as AdDigest;
}
