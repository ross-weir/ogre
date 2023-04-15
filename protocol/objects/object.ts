import { NetworkEncodable } from "../encoding.ts";

export type ObjectId = string & { readonly __brand: unique symbol };

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
