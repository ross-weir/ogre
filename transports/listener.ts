import { Connection } from "../net/mod.ts";
import { Multiaddr } from "../deps.ts";

export interface Listener {
  listen(addr: Multiaddr): AsyncIterable<Connection>;
  close(): void;
}
