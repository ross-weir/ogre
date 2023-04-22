import { OgreConfig } from "../config/mod.ts";
import { Component } from "../core/mod.ts";
import { log } from "../deps.ts";
import { SyncInfoMessage } from "../protocol/messages/sync_info/mod.ts";
import { REF_CLIENT_MILESTONE, SyncInfoV2 } from "../protocol/mod.ts";
import { Peer } from "./peer.ts";
import { peersQuery } from "./peers_query.ts";

export interface SyncManagerOpts {
  logger: log.Logger;
  config: OgreConfig;
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
  peer: Peer;
  chainState: PeerChainState;
  height?: number;
}

export class SyncManager extends Component {
  readonly #logger: log.Logger;
  readonly #config: OgreConfig;
  #sendSyncInfoTaskHandle?: number;
  #peerStatuses: PeerSyncStatus[] = [];

  constructor({ config, logger }: SyncManagerOpts) {
    super();

    this.#config = config;
    this.#logger = logger;
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

  getPeerStatus(peer: Peer): PeerSyncStatus | undefined {
    return this.#peerStatuses.find((ps) => ps.peer.isEqual(peer));
  }

  monitorPeer(peer: Peer) {
    // peer is already monitored
    if (this.getPeerStatus(peer)) {
      return;
    }

    this.#peerStatuses.push({ peer, chainState: PeerChainState.Unknown });
  }

  discardPeer(peer: Peer) {
    this.#peerStatuses = this.#peerStatuses.filter((ps) =>
      !ps.peer.isEqual(peer)
    );
  }

  sendSyncInfo() {
    // currently only v2 sync is supported
    const peers = peersQuery(this.#monitoredPeers).cmpVersion(
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

  get #monitoredPeers() {
    return this.#peerStatuses.map((ps) => ps.peer);
  }
}
