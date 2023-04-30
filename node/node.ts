import {
  mergeUserConfigAndValidate,
  NetworkType,
  OgreConfig,
  PartialOgreConfig,
} from "../config/mod.ts";
import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { setupLogging } from "../log/mod.ts";
import { ConnectionManager } from "../net/mod.ts";
import { PeerManager, PeerManagerEvents, PeerStore } from "../peers/mod.ts";
import { SyncManager } from "../peers/sync.ts";
import {
  DefaultMessageHandler,
  DefaultNetworkMessageCodec,
} from "../protocol/mod.ts";
import { Transport } from "../transports/mod.ts";
import { version } from "../version.ts";

/** Options used to configure Ogre. */
export interface NodeOpts {
  /** Which Ergo network to connect to. */
  networkType: NetworkType;
  /**
   * User supplied configuration.
   * Merged with a set of defaults defined for
   * the supplied network type.
   */
  config: PartialOgreConfig;
  /** Underlying network transport for the node. */
  transport: Transport;
}

// deno-lint-ignore no-empty-interface
export interface NodeEvents extends PeerManagerEvents {}

/** The main Ogre node class, encapsulates all node components. */
export class Ogre extends Component<NodeEvents> {
  #started = false;
  readonly #logger: log.Logger;
  readonly #components: Component[] = [];
  readonly config: OgreConfig;
  readonly opts: NodeOpts;
  readonly #peerManager: PeerManager;

  constructor(opts: NodeOpts) {
    super();

    this.opts = opts;
    this.config = mergeUserConfigAndValidate(opts.networkType, opts.config);

    setupLogging(this.config.logging);

    this.#logger = log.getLogger();

    const peerStore = new PeerStore({
      logger: this.#logger,
      configAddrs: this.config.peers.knownAddrs,
    });
    this.#components.push(peerStore);

    const connectionManager = new ConnectionManager({
      logger: this.#logger,
      peerStore,
      transport: opts.transport,
      maxConnections: this.config.peers.maxConnections,
    });
    this.#components.push(connectionManager);

    const codec = new DefaultNetworkMessageCodec(
      new Uint8Array(this.config.network.magicBytes),
    );
    const msgHandler = new DefaultMessageHandler({
      peerStore,
      config: this.config,
      codec,
      logger: this.#logger,
    });

    const syncManager = new SyncManager({
      logger: this.#logger,
      config: this.config,
    });
    this.#components.push(syncManager);

    this.#peerManager = new PeerManager({
      logger: this.#logger,
      config: this.config,
      codec,
    });
    this.#components.push(this.#peerManager);

    // handle new connections
    connectionManager.addEventListener(
      "connection:new",
      ({ detail }) => this.#peerManager.acceptConnection(detail),
    );

    // handle new peers
    this.#peerManager.addEventListener(
      "peer:new",
      (e) => {
        const { detail: peer } = e;

        syncManager.monitorPeer(peer);
        // handle peer messages received
        peer.addEventListener(
          "peer:message:recv",
          ({ detail: msg }) => msgHandler.handle(msg, peer),
        );
        this.#bubbleEvent(e);
      },
    );

    // Handle peer removed events
    this.#peerManager.addEventListener("peer:removed", (e) => {
      const { peer } = e.detail;

      syncManager.discardPeer(peer);
      this.#bubbleEvent(e);
    });
  }

  async start(): Promise<void> {
    if (this.#started) {
      this.#logger.debug("Ogre has already started");

      return;
    }

    this.#started = true;
    this.#logger.info(`starting ${this.#components.length} components`);

    await Promise.all(this.#components.map((c) => c.beforeStart()));
    await Promise.all(this.#components.map((c) => c.start()));
  }

  async stop(): Promise<void> {
    if (!this.#started) {
      this.#logger.debug("Ogre is not running");

      return;
    }

    this.#logger.info("shutting down");

    await Promise.all(this.#components.map((c) => c.stop()));
    this.#started = false;
  }

  /** The version of Ogre library. */
  get version(): string {
    return version;
  }

  #bubbleEvent<T>(e: CustomEvent<T>) {
    this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
  }
}
