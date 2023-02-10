import { Connection } from "../network/mod.ts";
import { Listener } from "./listener.ts";
import { Multiaddr } from "../deps.ts";

export interface DialOpts {
  signal: AbortSignal;
}

export interface Transport {
  dial(addr: Multiaddr, opts?: DialOpts): Promise<Connection>;
  createListener(): Listener;
}
