import { Connection } from "../net/mod.ts";
import { Multiaddr } from "../deps.ts";

/**
 * Listener implements listening for connections
 * over a particular transport type.
 */
export interface Listener {
  /**
   * Listen on the supplied address.
   * @param addr Listen on the supplied addr
   * @returns An async iterable of connections
   */
  listen(addr: Multiaddr): AsyncIterable<Connection>;

  /** Stop listening for connections. */
  close(): void;
}
