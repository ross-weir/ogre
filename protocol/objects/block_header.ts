import { AdDigest, adDigest, Digest32, digest32 } from "../../crypto/mod.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import {
  NetworkObject,
  OBJECT_ID_LENGTH,
  ObjectId,
  objectIdFromBytes,
  objectIdToBytes,
  ObjectTypeId,
} from "./object.ts";

export enum BlockVersion {
  /** Block version during mainnet launch */
  Initial = 1,
  /** Block version after the Hardening hard-fork Autolykos v2 PoW, witnesses in transactions Merkle tree */
  Hardening = 2,
  /** Block version after the 5.0 soft-fork 5.0 interpreter with JITC, monotonic height rule (EIP-39) */
  Interpreter50 = 3,
}

interface BlockHeaderOpts {
  version: BlockVersion;
  parentId: ObjectId;
  adProofRoot: Digest32;
  stateRoot: AdDigest;
  txRoot: Digest32;
  timestamp: bigint;
  nBits: number;
  height: number;
  extensionRoot: Digest32;
  // powSolution make optional or separate class like ref client?
  /** Votes are 3 bytes in size */
  votes: Uint8Array;
}

export class BlockHeader implements NetworkObject {
  readonly version: BlockVersion;
  readonly parentId: ObjectId;
  readonly adProofRoot: Digest32;
  readonly stateRoot: AdDigest;
  readonly txRoot: Digest32;
  readonly timestamp: bigint;
  readonly nBits: number;
  readonly height: number;
  readonly extensionRoot: Digest32;
  // powSolution make optional or separate class like ref client?
  /** Votes are 3 bytes in size */
  readonly votes: Uint8Array;

  constructor(opts: BlockHeaderOpts) {
    this.version = opts.version;
    this.parentId = opts.parentId;
    this.adProofRoot = opts.adProofRoot;
    this.stateRoot = opts.stateRoot;
    this.txRoot = opts.txRoot;
    this.timestamp = opts.timestamp;
    this.nBits = opts.nBits;
    this.height = opts.height;
    this.extensionRoot = opts.extensionRoot;
    this.votes = opts.votes;
  }

  get objectTypeId(): ObjectTypeId {
    return ObjectTypeId.BlockHeader;
  }

  encode(writer: CursorWriter): void {
    writer.putUint8(this.version);
    writer.putBytes(objectIdToBytes(this.parentId));
    writer.putBytes(this.adProofRoot);
    writer.putBytes(this.txRoot);
    writer.putBytes(this.stateRoot);
    writer.putUint64(this.timestamp);
    writer.putBytes(this.extensionRoot);
    // move to separate class
    const buf = new ArrayBuffer(4);
    const dv = new DataView(buf);
    dv.setUint32(0, this.nBits, false);
    writer.putBytes(new Uint8Array(buf));
    // move to separate class
    writer.putUint64(BigInt(this.height));
    writer.putBytes(this.votes);

    if (this.version > BlockVersion.Initial) {
      writer.putUint8(0);
    }
  }

  static decode(reader: CursorReader): BlockHeader {
    const version = reader.getUint8();
    const parentId = objectIdFromBytes(reader.getBytes(OBJECT_ID_LENGTH));
    const adProofRoot = digest32.fromBytes(reader.getBytes(32));
    const txRoot = digest32.fromBytes(reader.getBytes(32));
    const stateRoot = adDigest.fromBytes(reader.getBytes(33));
    const timestamp = reader.getUint64();
    const extensionRoot = digest32.fromBytes(reader.getBytes(32));
    // move to separate class
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
