import {
  BlockHeader,
  BlockVersion,
  IDENTIFIER_LENGTH,
  identifierFromBytes,
  identifierToBytes,
} from "../../chain/mod.ts";
import { adDigest, digest32 } from "../../crypto/mod.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { Serializer } from "./serializer.ts";

export class BlockHeaderSerializer extends Serializer<BlockHeader> {
  serialize(writer: CursorWriter, obj: BlockHeader): void {
    writer.putUint8(obj.version);
    writer.putBytes(identifierToBytes(obj.parentId));
    writer.putBytes(obj.adProofRoot);
    writer.putBytes(obj.txRoot);
    writer.putBytes(obj.stateRoot);
    writer.putUint64(obj.timestamp);
    writer.putBytes(obj.extensionRoot);
    // move to separate class "RequiredDifficulty" in ref client
    const buf = new ArrayBuffer(4);
    const dv = new DataView(buf);
    dv.setUint32(0, obj.nBits, false);
    writer.putBytes(new Uint8Array(buf));
    // move to separate class
    writer.putUint64(BigInt(obj.height));
    writer.putBytes(obj.votes);

    if (obj.version > BlockVersion.Initial) {
      writer.putUint8(0);
    }
  }

  deserialize(reader: CursorReader): BlockHeader {
    const version = reader.getUint8();
    const parentId = identifierFromBytes(reader.getBytes(IDENTIFIER_LENGTH));
    const adProofRoot = digest32.fromBytes(reader.getBytes(32));
    const txRoot = digest32.fromBytes(reader.getBytes(32));
    const stateRoot = adDigest.fromBytes(reader.getBytes(33));
    const timestamp = reader.getUint64();
    const extensionRoot = digest32.fromBytes(reader.getBytes(32));
    // move to separate class "RequiredDifficulty" in ref client
    const dv = new DataView(reader.getBytes(4).buffer);
    const nBits = dv.getUint32(0, false);
    // move to separate class
    const height = Number(reader.getUint64());
    const votes = reader.getBytes(3);

    if (version > BlockVersion.Initial) {
      const newFieldSize = reader.getUint8();

      if (newFieldSize > 0) {
        reader.getBytes(newFieldSize);
      }
    }

    return new BlockHeader({
      version,
      parentId,
      adProofRoot,
      txRoot,
      stateRoot,
      timestamp,
      extensionRoot,
      nBits,
      height,
      votes,
    });
  }
}
