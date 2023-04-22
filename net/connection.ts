import { Multiaddr } from "../deps.ts";
import { EventEmitter } from "../events/mod.ts";

/** The direction of the connection. */
export type ConnectionDirection = "inbound" | "outbound";

export interface ConnectionEvents {
  "connection:close": CustomEvent;
}

/** A connection to a remote peer. */
interface BaseConnection {
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
  /** Close the connection. */
  close: () => void;
}

export type Connection = BaseConnection & EventEmitter<ConnectionEvents>;

/** Wrap the connection so it emits events */
export function createConnection(base: BaseConnection): Connection {
  // const conn = new EventEmitter<ConnectionEvents>() as Connection;

  const conn = Object.assign(new EventEmitter<ConnectionEvents>(), base);

  conn.close = () => {
    base.close();
    conn.dispatchEvent(new CustomEvent("connection:close"));
  };

  return conn;
}
