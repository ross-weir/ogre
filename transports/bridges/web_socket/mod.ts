import { Connection } from "../../../net/mod.ts";
import { Multiaddr, multiaddrToUri } from "../../../deps.ts";
import { toMultiaddr } from "../../../multiaddr/mod.ts";
import { Listener } from "../../listener.ts";
import { DialOpts, Transport } from "../../transport.ts";
import { RpcMethod, sendAndReceive } from "./rpc.ts";
import {
  createCloseStream,
  createReadableStream,
  createWritableStream,
} from "./streams.ts";

/** Websocket bridge options. */
export interface WebSocketBridgeOpts {
  /** Address of the websocket server providing the bridge. */
  bridgeAddr: string;
}

/**
 * Create a transport that is bridged using websocket connections.
 *
 * This bridge will proxy TCP traffic through a websocket, useful
 * in web environments where low-level networking operations
 * aren't supported but websockets are.
 *
 * @param opts Websocket bridge options.
 * @returns A transport using a websocket bridge.
 */
export function websocketBridgeTransport(opts: WebSocketBridgeOpts): Transport {
  const ws = new WebSocket(multiaddrToUri(opts.bridgeAddr));

  return {
    async dial(addr: Multiaddr, _opts?: DialOpts): Promise<Connection> {
      const connId = crypto.randomUUID();
      const { host, port } = addr.toOptions();

      // create these first even though a connection has yet to be established
      // createReadableStream adds an event listener for particular ws messages,
      // this ensures none are missed.
      const readable = createReadableStream(ws, connId);
      const writable = createWritableStream(ws, connId);
      const close = createCloseStream(ws, connId);

      const { remoteAddr, localAddr } = await sendAndReceive(
        ws,
        RpcMethod.DialRequest,
        {
          connId,
          host,
          port,
        },
      );

      return {
        connId,
        localAddr: toMultiaddr(localAddr),
        remoteAddr: toMultiaddr(remoteAddr),
        direction: "outbound",
        readable,
        writable,
        close,
      };
    },
    createListener(): Listener {
      throw new Error("Method not implemented.");
    },
  };
}
