import { Component } from "../core/component.ts";
import { log, Multiaddr } from "../deps.ts";
import { EventEmitter } from "../events/mod.ts";
import { PeerAddressBook } from "../peers/mod.ts";
import { DialOpts, Transport } from "../transports/mod.ts";
import { Connection } from "./connection.ts";

export interface ConnectionManagerEvents {
  "peer:connect": CustomEvent<Connection>;
  "peer:disconnect": CustomEvent<Connection>;
}

const AUTO_DIAL_INTERVAL_MS = 10000;

export interface ConnectionManagerOpts {
  logger: log.Logger;
  transport: Transport;
  maxConnections: number;
  peerAddressBook: PeerAddressBook;
}

export class ConnectionManager extends EventEmitter<ConnectionManagerEvents>
  implements Component {
  readonly #logger: log.Logger;
  readonly #transport: Transport;
  readonly #maxConnections: number;
  readonly #peerAddressBook: PeerAddressBook;
  #connections: Connection[];
  #autoDialHandle?: number;

  constructor(
    { logger, transport, maxConnections, peerAddressBook }:
      ConnectionManagerOpts,
  ) {
    super();

    this.#logger = logger;
    this.#connections = [];
    this.#maxConnections = maxConnections;
    this.#peerAddressBook = peerAddressBook;
    this.#transport = transport;
  }

  async openConnection(addr: Multiaddr, opts?: DialOpts): Promise<Connection> {
    this.#logger.debug(`connecting to ${addr.toString()}`);

    // add to "pending connections" list, so it can be cancelled?
    const conn = await this.#transport.dial(addr, opts);

    this.#connections.push(conn);
    this.dispatchEvent(new CustomEvent("peer:connect", { detail: conn }));

    this.#logger.info(`connected to ${addr.toString()}`);

    return conn;
  }

  async closeConnection(conn: Connection): Promise<void> {
    // conn.close()
    this.#connections = this.#connections.filter((c) =>
      c.connId !== conn.connId
    );
  }

  async start(): Promise<void> {
    this.#logger.debug("connection manager starting");

    this.#autoDialHandle = setInterval(
      () => this.autoDialPeer(),
      AUTO_DIAL_INTERVAL_MS,
    );
  }

  async stop(): Promise<void> {
    if (this.#autoDialHandle) {
      clearInterval(this.#autoDialHandle);
    }

    // for all connections - close
  }

  private async autoDialPeer(): Promise<void> {
    if (this.#connections.length >= this.#maxConnections) {
      this.#logger.debug("already at max connections");

      return;
    }

    this.#logger.debug("auto dialing random peer");

    // what about pending connections?
    const potentialPeers = this.#peerAddressBook.addrs.filter((addr) =>
      !this.#connections.some((conn) => conn.remoteAddr.equals(addr))
    );

    if (!potentialPeers.length) {
      this.#logger.debug("auto dialer didn't find any peers to connect to");

      return;
    }

    const randomIndex = Math.floor(Math.random() * potentialPeers.length);
    const peerAddr = potentialPeers[randomIndex];

    await this.openConnection(peerAddr);
  }
}
