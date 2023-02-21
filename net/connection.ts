import { Multiaddr } from "../deps.ts";

/** The direction of the connection. */
export type ConnectionDirection = "inbound" | "outbound";

/** A connection to a remote peer. */
export interface Connection {
  /** Unique id assigned to the connection, uuid4 format. */
  connId: string;
  /** Local address for the connection. */
  localAddr: Multiaddr;
  /** Remote address for the connection. */
  remoteAddr: Multiaddr;
  /** Direction of the connection. */
  direction: ConnectionDirection;
  /** Writable stream for the connection. */
  writable: WritableStream<Uint8Array>;
  /** Readable stream for the connection. */
  readable: ReadableStream<Uint8Array>;
}
