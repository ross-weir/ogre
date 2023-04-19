import { bytesToHex, hexToBytes } from "../_utils/hex.ts";

export type Identifier = string & { readonly __brand: unique symbol };

export const identifier = {
  /** Length of object ids in bytes */
  requiredLength: 32,
  fromBytes(buf: Uint8Array): Identifier {
    if (buf.length !== this.requiredLength) {
      throw new RangeError(
        `identifierFromBytes: bad buffer length ${buf.length} != ${this.requiredLength}`,
      );
    }

    return bytesToHex(buf) as Identifier;
  },
  toBytes(id: Identifier): Uint8Array {
    return hexToBytes(id);
  },
};
