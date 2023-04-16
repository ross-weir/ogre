import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { NetworkEncodable } from "../encoding.ts";

/** Length of object ids in bytes */
export const OBJECT_ID_LENGTH = 32;

export type ObjectId = string & { readonly __brand: unique symbol };

export function objectIdFromBytes(buf: Uint8Array): ObjectId {
  return bytesToHex(buf) as ObjectId;
}

export function objectIdToBytes(objId: ObjectId): Uint8Array {
  return hexToBytes(objId);
}

export enum ObjectTypeId {
  /** Unconfirmed tx sent outside of blocks */
  Transaction = 2,
  BlockHeader = 101,
  /** All txs within a block */
  BlockTransaction = 102,
  Proof = 104,
  Extension = 108,
}

export interface NetworkObject extends NetworkEncodable {
  get objectTypeId(): ObjectTypeId;
}
