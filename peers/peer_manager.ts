import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { EventEmitter } from "../events/mod.ts";
import { Connection, ConnectionManager } from "../net/mod.ts";
import { NetworkMessageHandler, PeerSpec } from "../protocol/mod.ts";
import { Peer } from "./peer.ts";

export interface PeerManagerEvents {
  "peer:new": CustomEvent<Peer>;
}

export interface PeerManagerOpts {
  logger: log.Logger;
  connectionManager: ConnectionManager;
  // our peer spec sent with handshakes to remote peers
  spec: PeerSpec;
  msgHandler: NetworkMessageHandler;
}

export class PeerManager extends EventEmitter<PeerManagerEvents>
  implements Component {
  readonly #logger: log.Logger;
  readonly #connectionManager: ConnectionManager;
  readonly #spec: PeerSpec;
  readonly #msgHandler: NetworkMessageHandler;
  readonly #peers: Peer[] = [];

  constructor(
    { logger, connectionManager, spec, msgHandler }: PeerManagerOpts,
  ) {
    super();

    this.#logger = logger;
    this.#connectionManager = connectionManager;
    this.#spec = spec;
    this.#msgHandler = msgHandler;

    this.#connectionManager.addEventListener(
      "connection:new",
      ({ detail }) => this.#onConnection(detail),
    );
  }

  async start(): Promise<void> {
  }

  async stop(): Promise<void> {
  }

  #onConnection(conn: Connection) {
    this.#logger.info(`connection: ${conn.localAddr} -> ${conn.remoteAddr}`);

    const peer = new Peer({
      conn,
      localSpec: this.#spec,
      logger: this.#logger,
    });

    this.#peers.push(peer);
    this.dispatchEvent(new CustomEvent("peer:new", { detail: peer }));
    peer.addEventListener(
      "peer:message",
      ({ detail }) => this.#msgHandler.handle(detail, peer),
    );
    peer.start();
  }
}
