import {
  tcpTransport,
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

export function createNativeNode(opts: Omit<NodeOpts, "transport">) {
  const transport = tcpTransport();

  return new Ergode({ ...opts, transport });
}
