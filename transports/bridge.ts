import {
  WebSocketBridgeOpts,
  websocketBridgeTransport,
} from "./bridges/mod.ts";
import { Transport } from "./transport.ts";

export interface BridgeOptsMap {
  websocket: WebSocketBridgeOpts;
}

/**
 * Creates a bridged transport.
 *
 * Bridged transports are used to support functionality
 * not supported in certain environments and platforms.
 *
 * For example a node running in a web browser will
 * require a bridge to provide low level networking operations.
 *
 * @param bridgeType The type of bridge transport.
 * @param opts Options specific for the bridgeType.
 * @returns A transport over the specified bridge.
 */
export function bridgeTransport<K extends keyof BridgeOptsMap>(
  bridgeType: K,
  opts: BridgeOptsMap[K],
): Transport {
  switch (bridgeType) {
    case "websocket":
      return websocketBridgeTransport(opts);
    default:
      throw new Error();
  }
}
