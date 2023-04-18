import type { BlockHeader, Identifier } from "../chain/mod.ts";
import { identifier } from "../chain/mod.ts";
import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { NetworkEncodable } from "./encoding.ts";
import { BlockHeaderSerializer } from "./serializers/block_header.ts";

export enum SyncInfoVersion {
  V1,
  V2,
}

export abstract class SyncInfo<T> implements NetworkEncodable {
  readonly items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  get isEmpty(): boolean {
    return !this.items.length;
  }

  abstract get version(): SyncInfoVersion;
  abstract encode(writer: CursorWriter): void;
}

export class SyncInfoV1 extends SyncInfo<Identifier> {
  static MAX_ITEMS = 1000;

  get version(): SyncInfoVersion {
    return SyncInfoVersion.V1;
  }

  encode(writer: CursorWriter): void {
    writer.putUint16(this.items.length);
    this.items.forEach((id) => writer.putBytes(identifier.toBytes(id)));
  }

  /**
   * The length parameter is read by the message decoder first
   * in order to determine if the `SyncInfo` included in the `SyncInfoMessage`
   * is V1 or V2.
   */
  static decode(reader: CursorReader, length: number): SyncInfoV1 {
    if (length > this.MAX_ITEMS) {
      throw new RangeError(
        `SyncInfoV1.decode: length exceeds limit ${length} > ${this.MAX_ITEMS}`,
      );
    }

    const items = [];

    for (let i = 0; i < length; i += 1) {
      const bytes = reader.getBytes(identifier.requiredLength);
      items.push(identifier.fromBytes(bytes));
    }

    return new SyncInfoV1(items);
  }
}

export class SyncInfoV2 extends SyncInfo<BlockHeader> {
  static V2_MARKER = -1;
  static MAX_ITEMS = 50;
  static MAX_ITEM_SIZE_BYTES = 1000;

  get version(): SyncInfoVersion {
    return SyncInfoVersion.V2;
  }

  encode(writer: CursorWriter): void {
    writer.putInt8(SyncInfoV2.V2_MARKER);
    writer.putUint8(this.items.length);

    const headerSerializer = new BlockHeaderSerializer();

    this.items.forEach((h) => {
      const headerWriter = writer.newWriter();
      headerSerializer.serialize(headerWriter, h);

      writer.putUint16(headerWriter.buffer.byteLength);
      writer.putBytes(headerWriter.buffer);
    });
  }

  static decode(reader: CursorReader): SyncInfoV2 {
    const marker = reader.getInt8();

    if (marker !== this.V2_MARKER) {
      throw new Error(`SyncInfoV2.decode: unsupported marker value: ${marker}`);
    }

    const headersLength = reader.getUint8();

    if (headersLength > this.MAX_ITEMS) {
      throw new RangeError(
        `SyncInfoV2.decode: item length exceeds limit ${headersLength} > ${this.MAX_ITEMS}`,
      );
    }

    const headerSerializer = new BlockHeaderSerializer();
    const items = [];

    for (let i = 0; i < headersLength; i += 1) {
      const headerSize = reader.getUint16();

      if (headerSize > this.MAX_ITEM_SIZE_BYTES) {
        throw new RangeError(
          `SyncInfoV2.decode: header size exceeds limit ${headerSize} > ${this.MAX_ITEM_SIZE_BYTES}`,
        );
      }

      const headerBytes = reader.getBytes(headerSize);
      const headerReader = reader.newReader(headerBytes);
      const header = headerSerializer.deserialize(headerReader);

      items.push(header);
    }

    return new SyncInfoV2(items);
  }
}
