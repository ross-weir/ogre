import { OgreConfig } from "../config/mod.ts";
import { Component, Guid } from "../core/mod.ts";
import { log } from "../deps.ts";
import { SyncInfoMessage } from "../protocol/messages/sync_info/mod.ts";
import { REF_CLIENT_MILESTONE, SyncInfoV2 } from "../protocol/mod.ts";
import { PeerManager } from "./peer_manager.ts";
import { peersQuery } from "./peers_query.ts";

export interface SyncManagerOpts {
  logger: log.Logger;
  config: OgreConfig;
  peerManager: PeerManager;
}

/** State of the peers chain in relation to our own */
export enum PeerChainState {
  Equal,
  Unknown,
  Younger,
  Fork,
  Older,
}

export interface PeerSyncStatus {
  state: PeerChainState;
  height: number;
}

export class SyncManager extends Component {
  readonly #logger: log.Logger;
  readonly #config: OgreConfig;
  readonly #peerManager: PeerManager;
  #sendSyncInfoTaskHandle?: number;
  /** Peer guid to sync state mapping */
  readonly #peerSyncMap: Record<Guid, PeerSyncStatus> = {};

  constructor({ config, logger, peerManager }: SyncManagerOpts) {
    super();

    this.#config = config;
    this.#logger = logger;
    this.#peerManager = peerManager;
  }

  start(): Promise<void> {
    this.#sendSyncInfoTaskHandle = setInterval(
      () => this.sendSyncInfo(),
      this.#config.peers.syncIntervalSec * 1000,
    );

    return Promise.resolve();
  }

  stop(): Promise<void> {
    clearInterval(this.#sendSyncInfoTaskHandle);

    return Promise.resolve();
  }

  sendSyncInfo() {
    // currently only v2 sync is supported
    const peers = peersQuery(this.#peerManager.peers).cmpVersion(
      ">=",
      REF_CLIENT_MILESTONE.syncV2,
    ).peers();

    if (!peers.length) {
      return;
    }

    this.#logger.info(`sendSyncInfo sending sync msg to ${peers.length} peers`);

    // TODO: determine what to send in sync info msg
    const msg = new SyncInfoMessage(new SyncInfoV2([]));
    // update each peers last sync send time
    peers.forEach((p) => p.send(msg));
  }
}
