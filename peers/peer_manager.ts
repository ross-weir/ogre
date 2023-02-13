import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { Connection, ConnectionManager } from "../net/mod.ts";

export interface PeerManagerOpts {
  logger: log.Logger;
  connectionManager: ConnectionManager;
}

export class PeerManager implements Component {
  readonly #logger: log.Logger;
  readonly #connectionManager: ConnectionManager;

  constructor({ logger, connectionManager }: PeerManagerOpts) {
    this.#logger = logger;
    this.#connectionManager = connectionManager;

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
  }
}
