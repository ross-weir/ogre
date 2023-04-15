export type Digest32 = Uint8Array & { readonly __brand: unique symbol };

/**
 * AdDigest is 33 bytes in size
 * An extra byte included for tree height
 */
export type AdDigest = Uint8Array & { readonly __brand: unique symbol };
