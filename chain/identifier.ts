import { bytesToHex, hexToBytes } from "../_utils/hex.ts";

/** Length of object ids in bytes */
export const IDENTIFIER_LENGTH = 32;

export type Identifier = string & { readonly __brand: unique symbol };

export function identifierFromBytes(buf: Uint8Array): Identifier {
  if (buf.length !== IDENTIFIER_LENGTH) {
    throw new RangeError(
      `identifierFromBytes: bad buffer length ${buf.length} != ${IDENTIFIER_LENGTH}`,
    );
  }

  return bytesToHex(buf) as Identifier;
}

export function identifierToBytes(id: Identifier): Uint8Array {
  return hexToBytes(id);
}
