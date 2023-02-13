import {
  mergeUserConfigAndValidate,
  NetworkType,
  PartialErgodeConfig,
} from "../config/mod.ts";
import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { setupLogging } from "../log/mod.ts";
import { ConnectionManager } from "../net/connection_manager.ts";
import { PeerAddressBook } from "../peers/mod.ts";
import { Transport } from "../transports/mod.ts";

export interface NodeOpts {
  networkType: NetworkType;
  config: PartialErgodeConfig;
  transport: Transport;
  gatherMetrics?: boolean;
}

export class Ergode implements Component {
  readonly #logger: log.Logger;
  readonly #components: Component[] = [];

  constructor(opts: NodeOpts) {
    const config = mergeUserConfigAndValidate(opts.networkType, opts.config);

    setupLogging(config.logging);

    this.#logger = log.getLogger();
    const components: Component[] = [];

    const peerAddressBook = new PeerAddressBook({
      logger: this.#logger,
      configAddrs: config.peers.knownAddrs,
    });
    components.push(peerAddressBook);

    const connectionManager = new ConnectionManager({
      logger: this.#logger,
      peerAddressBook,
      transport: opts.transport,
      maxConnections: config.peers.maxConnections,
    });
    components.push(connectionManager);

    // peerManager - accepts database, subscribes to connection manager events oe does it need to?
    //  - subscribe to connection manager connect / disconnect and create/handshake or remove peers
    //  - creates peers or does it just manage peers? i.e subscribes to some other service that estbashlishes peers first?
    //  - evict peers after n time

    // message handler - subscribers to "new peer" events and subscribes to peers "message" events, etc, will need access to database/peerManager/connectionManager/etc

    // metric gatherer? subscribe to events from previous components

    // create context

    // create all components from context
  }

  async start(): Promise<void> {
    this.#logger.info("starting..");

    await Promise.all(this.#components.map((c) => c.start()));
  }

  async stop(): Promise<void> {
    this.#logger.info("shutting down");

    await Promise.all(this.#components.map((c) => c.stop()));
  }
}
