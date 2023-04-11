import { Multiaddr } from "../deps.ts";
import { toMultiaddr } from "../multiaddr/mod.ts";
import { Connection } from "../net/connection.ts";
import { Listener } from "./listener.ts";
import { DialOpts, Transport } from "./transport.ts";

function denoAddrToMulti(addr: Deno.NetAddr): Multiaddr {
  const { hostname, port } = addr;

  return toMultiaddr(`${hostname}:${port}`);
}

/**
 * Creates a TCP transport that uses
 * networking functions directly without
 * the use of a bridge component.
 *
 * This bridge is suitable for nodes running
 * natively on windows/linux/apple platforms.
 *
 * @returns TCP based transport.
 */
export function tcpTransport(): Transport {
  return {
    async dial(addr: Multiaddr, _opts?: DialOpts): Promise<Connection> {
      const connId = crypto.randomUUID();
      const { port, host: hostname } = addr.toOptions();
      const conn = await Deno.connect({ port, hostname });

      return {
        connId,
        localAddr: denoAddrToMulti(conn.localAddr as Deno.NetAddr),
        remoteAddr: denoAddrToMulti(conn.remoteAddr as Deno.NetAddr),
        direction: "outbound",
        readable: conn.readable,
        writable: conn.writable,
        close: conn.close,
      };
    },
    createListener(): Listener {
      throw new Error("not implemented yet");
    },
  };
}
