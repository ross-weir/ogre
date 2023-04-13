import { WebSocketBridgeOpts } from "../transports/bridges/mod.ts";
import { bridgeTransport, tcpTransport } from "../transports/mod.ts";
import { NodeOpts, Ogre } from "./node.ts";

/**
 * Creates a node with configuration suitable for
 * running on web based platforms like browsers,
 * web extensions and webviews.
 *
 * Some differences to the native node are
 * web based nodes require a bridge transport
 * and cannot use file system logs.
 *
 * @param opts Options for the node
 * @param bridgeOpts Options for the bridge
 * @returns A node configured for web platforms
 */
export function createWebNode(
  opts: Omit<NodeOpts, "transport">,
  bridgeOpts: WebSocketBridgeOpts,
) {
  const transport = bridgeTransport("websocket", bridgeOpts);

  // only console logging
  // setup web compatible db
  // setup web only stuff

  return new Ogre({ ...opts, transport });
}

/**
 * Creates a node with a configuration suitable for
 * running on native platforms such as windows, linux & apple.
 *
 * Some differences to the web node are using
 * tcp connections directly instead of a bridge
 * and file system logging.
 *
 * @param opts Options for the node
 * @returns A node configured for native platforms
 */
export function createNativeNode(opts: Omit<NodeOpts, "transport">) {
  const transport = tcpTransport();

  return new Ogre({ ...opts, transport });
}
