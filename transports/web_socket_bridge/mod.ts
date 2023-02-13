import { Connection } from "../../net/mod.ts";
import { Multiaddr, multiaddrToUri } from "../../deps.ts";
import { toMultiaddr } from "../../multiaddr/mod.ts";
import { Listener } from "../listener.ts";
import { DialOpts, Transport } from "../transport.ts";
import { RpcMethod, sendAndReceive } from "./rpc.ts";
import { createReadableStream, createWritableStream } from "./streams.ts";

export interface WebSocketBridgeOpts {
  bridgeAddr: Multiaddr;
}

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
      };
    },
    createListener(): Listener {
      throw new Error("Method not implemented.");
    },
  };
}
