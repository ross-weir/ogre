import { Multiaddr } from "../deps.ts";

export type ConnectionDirection = "inbound" | "outbound";

export interface Connection {
  connId: string;
  localAddr: Multiaddr;
  remoteAddr: Multiaddr;
  direction: ConnectionDirection;
  writable: WritableStream<Uint8Array>;
  readable: ReadableStream<Uint8Array>;
}
