import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { PeerFeature, PeerFeatureId } from "./peer_feature.ts";

function randInt64() {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);

  // Use a bitmask to ensure that the generated value is within the valid i64 range
  const mask = (1n << 63n) - 1n;
  return (BigInt(randomValues[0]) << 32n | BigInt(randomValues[1])) & mask;
}

const MAGIC_BYTES_LEN = 4;

export interface SessionIdOpts {
  magicBytes: Uint8Array;
  sessionId: bigint;
}

export class SessionIdPeerFeature extends PeerFeature {
  readonly magicBytes: Uint8Array;
  readonly sessionId: bigint;

  constructor({ magicBytes, sessionId }: SessionIdOpts) {
    super();

    this.magicBytes = magicBytes;
    this.sessionId = sessionId;
  }

  get id(): PeerFeatureId {
    return PeerFeatureId.SessionId;
  }

  encode(writer: CursorWriter): void {
    writer.putBytes(this.magicBytes);
    writer.putInt64(this.sessionId);
  }

  static decode(reader: CursorReader): SessionIdPeerFeature {
    const magicBytes = reader.getBytes(MAGIC_BYTES_LEN);
    const sessionId = reader.getInt64();

    return new SessionIdPeerFeature({ magicBytes, sessionId });
  }

  static fromMagicBytes(magicBytes: Uint8Array): SessionIdPeerFeature {
    return new SessionIdPeerFeature({ magicBytes, sessionId: randInt64() });
  }
}
