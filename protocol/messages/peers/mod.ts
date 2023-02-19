import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { Peer } from "../../../peers/peer.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";
import { PeerSpec } from "../../peer_spec/mod.ts";
import { MessageHandlerContext } from "../handler_context.ts";

/** Current value used in reference client. */
const PEERS_MAX_LIMIT = 64;

export class PeersMessage extends InitialNetworkMessage {
  readonly peers: PeerSpec[];

  constructor(peers: PeerSpec[]) {
    super();

    this.peers = peers;
  }

  get code(): MessageCode {
    return MessageCode.Peers;
  }

  get name(): string {
    return "Peers";
  }

  encode(writer: CursorWriter): void {
    writer.putUint32(this.peers.length);
    this.peers.forEach((p) => p.encode(writer));
  }

  static decode(reader: CursorReader): PeersMessage {
    const peersLen = reader.getUint32();

    if (peersLen > PEERS_MAX_LIMIT) {
      throw new Error("Too many peers in message");
    }

    const peers = [];

    for (let i = 0; i < peersLen; i += 1) {
      peers.push(PeerSpec.decode(reader));
    }

    return new PeersMessage(peers);
  }
}

export function peersHandler(
  reader: CursorReader,
  peer: Peer,
  ctx: MessageHandlerContext,
): Promise<void> {
  const peersMsg = PeersMessage.decode(reader);

  return Promise.resolve();
}
