import { AdDigest, Digest32 } from "../crypto/mod.ts";
import { Identifier } from "./identifier.ts";

export enum BlockVersion {
  /** Block version during mainnet launch */
  Initial = 1,
  /** Block version after the Hardening hard-fork Autolykos v2 PoW, witnesses in transactions Merkle tree */
  Hardening = 2,
  /** Block version after the 5.0 soft-fork 5.0 interpreter with JITC, monotonic height rule (EIP-39) */
  Interpreter50 = 3,
}

interface BlockHeaderFields {
  version: BlockVersion;
  parentId: Identifier;
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

/**
 * NOTE: The reference client uses 2 separate types, a header with pow solution
 * and a header without pow solution, not sure why this is needed at the moment
 * so just going with the one type for now.
 */
export class BlockHeader {
  readonly version: BlockVersion;
  readonly parentId: Identifier;
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

  constructor(opts: BlockHeaderFields) {
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
}
