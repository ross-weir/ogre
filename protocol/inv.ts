import { Identifier, identifier } from "../chain/identifier.ts";
import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { NetworkEncodable } from "./encoding.ts";

/** Chain network modifier ids used as part of the protocol */
export enum ModifierType {
  /** Unconfirmed tx sent outside of blocks */
  Transaction = 2,
  BlockHeader = 101,
  /** All txs within a block */
  BlockTransaction = 102,
  Proof = 104,
  Extension = 108,
}

export function isModifierType(typeId: number): typeId is ModifierType {
  return Object.values(ModifierType).includes(typeId);
}

export class InvPayload implements NetworkEncodable {
  static readonly MAX_ITEMS = 400;
  readonly type: ModifierType;
  readonly ids: Identifier[];

  constructor(type: ModifierType, ids: Identifier[]) {
    this.type = type;
    this.ids = ids;
  }

  encode(writer: CursorWriter): void {
    writer.putUint8(this.type);
    writer.putUint32(this.ids.length);

    this.ids.forEach((id) => {
      writer.putBytes(identifier.toBytes(id));
    });
  }

  static decode(reader: CursorReader): InvPayload {
    const type = reader.getUint8();

    if (!isModifierType(type)) {
      throw new Error(`InvPayload.decode invalid object type id ${type}`);
    }

    const idsLength = reader.getUint32();

    if (idsLength < 1) {
      throw new RangeError(
        `InvPayload.decode less than 1 object ids provided: ${idsLength}`,
      );
    }

    if (idsLength > this.MAX_ITEMS) {
      throw new RangeError(
        `InvPayload.decode object ids provided exceeds limit ${idsLength} > ${this.MAX_ITEMS}`,
      );
    }

    const ids = [];

    for (let i = 0; i < idsLength; i += 1) {
      const idBytes = reader.getBytes(identifier.requiredLength);

      ids.push(identifier.fromBytes(idBytes));
    }

    return new InvPayload(type, ids);
  }
}
