import {
  WebSocketBridgeOpts,
  websocketBridgeTransport,
} from "../transports/mod.ts";
import { Ergode, NodeOpts } from "./node.ts";

export function createWebNode(
  opts: Omit<NodeOpts, "transport">,
  bridgeOpts: WebSocketBridgeOpts,
) {
  const transport = websocketBridgeTransport(bridgeOpts);

  // only console logging
  // setup web compatible db
  // setup web only stuff

  return new Ergode({ ...opts, transport });
}
