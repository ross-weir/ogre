import { Peer } from "../../peers/mod.ts";
import { MessageCode, NetworkMessage } from "../message.ts";
import { getPeersHandler } from "./get_peers/mod.ts";
import { MessageHandlerContext } from "./handler_context.ts";
import { peersHandler } from "./peers/mod.ts";

/** Handles network messages as they arrive over the `Transport`. */
export interface NetworkMessageHandler {
  /** Function performing peer message handling */
  handle(msg: NetworkMessage, peer: Peer): Promise<void>;
}

export class DefaultMessageHandler implements NetworkMessageHandler {
  readonly #ctx: MessageHandlerContext;

  constructor(ctx: MessageHandlerContext) {
    this.#ctx = ctx;
  }

  handle(msg: NetworkMessage, peer: Peer): Promise<void> {
    this.#ctx.logger.debug(`handling message: ${msg.name} (${msg.code})`);

    switch (msg.code) {
      case MessageCode.Peers:
        // deno-lint-ignore no-explicit-any
        return peersHandler(msg as any, peer, this.#ctx);
      case MessageCode.GetPeers:
        // deno-lint-ignore no-explicit-any
        return getPeersHandler(msg as any, peer, this.#ctx);
      default:
        return Promise.resolve();
    }
  }
}
