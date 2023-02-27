import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { ScorexWriter } from "../../../io/scorex_buffer.ts";
import { Peer } from "../../../peers/mod.ts";
import { UnexpectedDataError } from "../../errors.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";
import { MessageHandlerContext } from "../handler_context.ts";
import { PeersMessage } from "../peers/mod.ts";

export class GetPeersMessage extends InitialNetworkMessage {
  get code(): MessageCode {
    return MessageCode.GetPeers;
  }

  get name(): string {
    return "GetPeers";
  }

  encode(_writer: CursorWriter): void {
  }

  static decode(reader: CursorReader): GetPeersMessage {
    if (reader.buffer.byteLength > 0) {
      throw new UnexpectedDataError(
        `GetPeers message included unexpected data of ${reader.buffer.byteLength} bytes`,
      );
    }

    return new GetPeersMessage();
  }
}

/** Handle `GetPeers` network message. */
export async function getPeersHandler(
  _reader: CursorReader,
  peer: Peer,
  ctx: MessageHandlerContext,
): Promise<void> {
  const peersMsg = new PeersMessage(ctx.peerStore.peerSpecs);
  const writer = await ScorexWriter.create();

  peersMsg.encode(writer);
  peer.send(writer.buffer);
}
