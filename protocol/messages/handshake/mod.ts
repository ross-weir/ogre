import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";
import { PeerSpec } from "../../peer_spec/mod.ts";

export const MAX_HANDSHAKE_SIZE = 8096;

export class Handshake extends InitialNetworkMessage {
  readonly unixTimestamp: bigint;
  readonly peerSpec: PeerSpec;

  constructor(unixTimestamp: bigint, peerSpec: PeerSpec) {
    super();

    this.unixTimestamp = unixTimestamp;
    this.peerSpec = peerSpec;
  }

  get code(): MessageCode {
    return MessageCode.Handshake;
  }

  get name(): string {
    return "Handshake";
  }

  encode(writer: CursorWriter): void {
    writer.putUint64(this.unixTimestamp);
    this.peerSpec.encode(writer);
  }

  static decode(reader: CursorReader): Handshake {
    if (reader.buffer.byteLength > MAX_HANDSHAKE_SIZE) {
      throw new Error("bad handshake size");
    }

    const ts = reader.getUint64();
    const peerSpec = PeerSpec.decode(reader);

    return new Handshake(ts, peerSpec);
  }

  static withSpec(spec: PeerSpec): Handshake {
    return new Handshake(BigInt(Date.now()), spec);
  }
}
