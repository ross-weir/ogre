import { CursorWriter } from "../../io/cursor_buffer.ts";
import { NetworkEncodable } from "../encoding.ts";

export enum ObjectTypeId {
  /** Unconfirmed tx sent outside of blocks */
  Transaction = 2,
  BlockHeader = 101,
  /** All txs within a block */
  BlockTransaction = 102,
  Proof = 104,
  Extension = 108,
}

export abstract class NetworkObject<T> implements NetworkEncodable {
  readonly inner: T;

  constructor(inner: T) {
    this.inner = inner;
  }

  abstract get objectTypeId(): ObjectTypeId;

  abstract encode(writer: CursorWriter): void;
}
