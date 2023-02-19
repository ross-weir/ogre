import { Connection } from "../net/mod.ts";
import { Listener } from "./listener.ts";
import { Multiaddr } from "../deps.ts";

/** Options for dialing a new connection. */
export interface DialOpts {
  /** Signal used to abort an in-progress dial. */
  signal: AbortSignal;
}

/** Transports provide connection and listening networking operations. */
export interface Transport {
  /**
   * Dial/connect to a remote peer.
   * @param addr Address to connect to in multiaddr format.
   * @param opts Dial options.
   * @returns An established connection.
   */
  dial(addr: Multiaddr, opts?: DialOpts): Promise<Connection>;

  /**
   * Create a listener that listens for incoming connections
   * over the concrete transport type.
   */
  createListener(): Listener;
}
