import {
  AdDigest,
  Digest32,
  newAdDigest,
  newDigest32,
} from "../../crypto/mod.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { NetworkObject, ObjectId, ObjectTypeId } from "./object.ts";

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
  requiredDifficulty: number;
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
  /** `nBits` in ref client */
  readonly requiredDifficulty: number;
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
    this.requiredDifficulty = opts.requiredDifficulty;
    this.height = opts.height;
    this.extensionRoot = opts.extensionRoot;
    this.votes = opts.votes;
  }

  get objectTypeId(): ObjectTypeId {
    return ObjectTypeId.BlockHeader;
  }

  encode(writer: CursorWriter): void {
    writer.putInt8(this.version);
    // parentId
    writer.putBytes(this.adProofRoot);
    writer.putBytes(this.txRoot);
    writer.putBytes(this.stateRoot);
    writer.putUint64(this.timestamp);
    writer.putBytes(this.extensionRoot);
    // nbits difficulty RequiredDifficulty.serialize
    writer.putUint32(this.height);
    writer.putBytes(this.votes);

    if (this.version > BlockVersion.Initial) {
      writer.putUint8(0);
    }
  }

  static decode(reader: CursorReader): BlockHeader {
    const version = reader.getUint8();
    // parentId
    const adProofRoot = newDigest32(reader.getBytes(32));
    const txRoot = newDigest32(reader.getBytes(32));
    const stateRoot = newAdDigest(reader.getBytes(33));
    const timestamp = reader.getUint64();
    const extensionRoot = newDigest32(reader.getBytes(32));
    // nbits (difficulty)
    const height = reader.getUint32();
    const votes = reader.getBytes(3);

    return new BlockHeader({
      version,
      parentId: "" as ObjectId, // TODO
      adProofRoot,
      txRoot,
      stateRoot,
      timestamp,
      extensionRoot,
      requiredDifficulty: 0, // TODO
      height,
      votes,
    });
  }
}
