import { CursorReader } from "../../io/cursor_buffer.ts";
import { ScorexReader } from "../../io/scorex_buffer.ts";
import { Peer } from "../../peers/mod.ts";
import { isBytesEq } from "../../_utils/mod.ts";
import { BadMagicBytesError, UnsupportedMessageCodeError } from "../errors.ts";
import { MessageCode, RawNetworkMessage } from "../message.ts";
import { getPeersHandler } from "./get_peers/mod.ts";
import { MessageHandlerContext } from "./handler_context.ts";
import { peersHandler } from "./peers/mod.ts";

/** Handles network messages as they arrive over the `Transport`. */
export interface NetworkMessageHandler {
  /** Function performing peer message handling */
  handle(msg: Uint8Array, peer: Peer): Promise<void>;
}

type ConcreteHandlerFn = (
  reader: CursorReader,
  peer: Peer,
  ctx: MessageHandlerContext,
) => Promise<void>;

const _handlerMap: Record<number, ConcreteHandlerFn> = {
  [MessageCode.GetPeers]: getPeersHandler,
  [MessageCode.Peers]: peersHandler,
};

export class DefaultMessageHandler implements NetworkMessageHandler {
  readonly #ctx: MessageHandlerContext;

  constructor(ctx: MessageHandlerContext) {
    this.#ctx = ctx;
  }

  async handle(msg: Uint8Array, peer: Peer): Promise<void> {
    // create scorex reader
    // parse msg into concrete message/validate
    // call concrete message handler
    try {
      return await this.#handleMsg(msg, peer);
    } catch (e) {
      // check if malicious msg & handle/raise event
      throw e;
    }
  }

  async #handleMsg(msg: Uint8Array, peer: Peer): Promise<void> {
    const reader = await ScorexReader.create(msg);
    const decodedMsg = RawNetworkMessage.decode(reader);
    const expectedMagic = new Uint8Array(this.#ctx.config.network.magicBytes);

    if (!isBytesEq(decodedMsg.magicBytes, expectedMagic)) {
      throw new BadMagicBytesError(decodedMsg.magicBytes);
    }

    const fn = _handlerMap[decodedMsg.code];

    if (!fn) {
      throw new UnsupportedMessageCodeError(decodedMsg.code);
    }

    return fn(reader.newReader(decodedMsg.body), peer, this.#ctx);
  }
}
