import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { Peer } from "../../../peers/peer.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";
import { MessageHandlerContext } from "../handler_context.ts";

export class Peers extends InitialNetworkMessage {
  get code(): MessageCode {
    return MessageCode.Peers;
  }

  get name(): string {
    return "Peers";
  }

  encode(writer: CursorWriter): void {
    throw new Error("Method not implemented.");
  }

  static decode(reader: CursorReader): Peers {
    throw new Error("not implemented");
  }
}

export function peersHandler(
  reader: CursorReader,
  peer: Peer,
  ctx: MessageHandlerContext,
): Promise<void> {
  const peersMsg = Peers.decode(reader);

  return Promise.resolve();
}
