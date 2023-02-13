import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { Connection, ConnectionManager } from "../net/mod.ts";
import { PeerSpec } from "../protocol/mod.ts";

export interface PeerManagerOpts {
  logger: log.Logger;
  connectionManager: ConnectionManager;
  // our peer spec sent with handshakes to remote peers
  spec: PeerSpec;
}

export class PeerManager implements Component {
  readonly #logger: log.Logger;
  readonly #connectionManager: ConnectionManager;
  readonly #spec: PeerSpec;
  // #peers: Peer[];

  constructor({ logger, connectionManager, spec }: PeerManagerOpts) {
    this.#logger = logger;
    this.#connectionManager = connectionManager;
    this.#spec = spec;

    this.#connectionManager.addEventListener(
      "peer:connect",
      ({ detail }) => this.onConnection(detail),
    );
  }

  async start(): Promise<void> {
  }

  async stop(): Promise<void> {
  }

  private onConnection(conn: Connection) {
    this.#logger.info("new connection, establishing handshake", conn);

    // send handshake
    // wait for handshake
    // add to peers list
    // read all messages
  }
}
