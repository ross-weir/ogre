import { secp256k1 } from "../deps.ts";

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

export const CURVE = secp256k1.CURVE;
export const CurvePoint = secp256k1.ProjectivePoint;
// deno-lint-ignore no-empty-interface
export interface ICurvePoint extends InstanceType<typeof CurvePoint> {}

export const GROUP_ELEMENT_SIZE = 256 / 8; // 32 bytes
/**
 * Standard compression of points:
 * Group elements are encoded as {0x2 if y point > 0 else 0x3} + {x point encoded bytes}
 */
export const GROUP_ELEMENT_ENCODED_SIZE = GROUP_ELEMENT_SIZE + 1;
export const GROUP_ELEMENT_IDENTITY = CurvePoint.ZERO;
export const GROUP_ELEMENT_GENERATOR = CurvePoint.BASE;
