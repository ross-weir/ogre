import {
  BlockHeader,
  BlockVersion,
  IDENTIFIER_LENGTH,
  identifierFromBytes,
  identifierToBytes,
} from "../../chain/mod.ts";
import { adDigest, digest32 } from "../../crypto/mod.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { NetworkObject, ObjectTypeId } from "./object.ts";

export class BlockHeaderNetworkObject extends NetworkObject<BlockHeader> {
  get objectTypeId(): ObjectTypeId {
    return ObjectTypeId.BlockHeader;
  }

  encode(writer: CursorWriter): void {
    writer.putUint8(this.inner.version);
    writer.putBytes(identifierToBytes(this.inner.parentId));
    writer.putBytes(this.inner.adProofRoot);
    writer.putBytes(this.inner.txRoot);
    writer.putBytes(this.inner.stateRoot);
    writer.putUint64(this.inner.timestamp);
    writer.putBytes(this.inner.extensionRoot);
    // move to separate class "RequiredDifficulty" in ref client
    const buf = new ArrayBuffer(4);
    const dv = new DataView(buf);
    dv.setUint32(0, this.inner.nBits, false);
    writer.putBytes(new Uint8Array(buf));
    // move to separate class
    writer.putUint64(BigInt(this.inner.height));
    writer.putBytes(this.inner.votes);

    if (this.inner.version > BlockVersion.Initial) {
      writer.putUint8(0);
    }
  }

  static decode(reader: CursorReader): BlockHeaderNetworkObject {
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

    const bh = new BlockHeader({
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

    return new BlockHeaderNetworkObject(bh);
  }
}
