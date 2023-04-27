import { OgreConfig } from "../config/mod.ts";
import { Component } from "../core/mod.ts";
import { datetime, log } from "../deps.ts";
import { SyncInfoMessage } from "../protocol/messages/sync_info/mod.ts";
import { REF_CLIENT_MILESTONE, SyncInfoV2 } from "../protocol/mod.ts";
import { Peer } from "./peer.ts";

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

export interface PeerSyncState {
  readonly peer: Peer;
  chainState: PeerChainState;
  height?: number;
  lastSyncSentAt?: Date;
}

function getStatesByOutdated(states: readonly PeerSyncState[]) {
  return states.filter((s) => {
    if (!s.lastSyncSentAt) {
      return false;
    }

    const { seconds } = datetime.difference(s.lastSyncSentAt, new Date(), {
      units: ["seconds"],
    });

    return seconds! >= SyncManager.OUTDATED_SYNC_THRESHOLD_SEC;
  });
}

function getStatesByChainSyncState(
  states: readonly PeerSyncState[],
  chainState: PeerChainState,
) {
  return states.filter((s) => s.chainState === chainState);
}

export const _internals = { getStatesByOutdated, getStatesByChainSyncState };

export class SyncManager extends Component {
  /** Seconds that must have elapsed before we consider peer for another `SyncInfo` message */
  static readonly MIN_SYNC_INTERVAL_SEC = 20;
  /** Seconds since last `SyncInfo` message was sent to consider a peer "outdated" */
  static readonly OUTDATED_SYNC_THRESHOLD_SEC = 60;
  readonly #logger: log.Logger;
  readonly #config: OgreConfig;
  #sendSyncInfoTaskHandle?: number;
  #states: PeerSyncState[] = [];

  constructor({ config, logger }: SyncManagerOpts) {
    super();

    this.#config = config;
    this.#logger = logger;
  }

  override start(): Promise<void> {
    this.#sendSyncInfoTaskHandle = setInterval(
      () => this.sendSyncInfo(),
      this.#config.peers.syncIntervalSec * 1000,
    );

    return Promise.resolve();
  }

  override stop(): Promise<void> {
    clearInterval(this.#sendSyncInfoTaskHandle);

    return Promise.resolve();
  }

  get states(): readonly PeerSyncState[] {
    return this.#states;
  }

  getPeerSyncState(peer: Peer): PeerSyncState | undefined {
    return this.#states.find((ps) => ps.peer.isEqual(peer));
  }

  monitorPeer(peer: Peer) {
    // peer is already monitored
    if (this.getPeerSyncState(peer)) {
      return;
    }

    this.#states.push({ peer, chainState: PeerChainState.Unknown });
  }

  discardPeer(peer: Peer) {
    this.#states = this.#states.filter((ps) => !ps.peer.isEqual(peer));
  }

  sendSyncInfo() {
    // currently only v2 sync is supported
    const states = this.#getStatesForSyncInfoMsg();

    if (!states.length) {
      return;
    }

    this.#logger.info(
      `sendSyncInfo sending sync msg to ${states.length} peers`,
    );

    // TODO: determine what to send in sync info msg
    const msg = new SyncInfoMessage(new SyncInfoV2([]));

    states.forEach((s) => {
      if (
        !s.peer.handshake?.peerSpec.refNodeVersion.gte(
          REF_CLIENT_MILESTONE.syncV2,
        )
      ) {
        this.#logger.info(
          "sendSyncInfo skipping node with SyncInfoV1 or no handshake",
        );

        return;
      }

      s.lastSyncSentAt = new Date();
      s.peer.send(msg);
    });
  }

  #getStatesForSyncInfoMsg(): PeerSyncState[] {
    const outdated = this.#outdatedStates();

    if (outdated.length) {
      return outdated;
    }

    const states: PeerSyncState[] = [
      ...this.#statesByChainState(PeerChainState.Unknown),
      ...this.#statesByChainState(PeerChainState.Fork),
    ];

    const elders = this.#statesByChainState(PeerChainState.Older);

    if (elders.length) {
      const randomIndex = Math.floor(Math.random() * elders.length);

      states.push(elders[randomIndex]);
    }

    const validStates = states.filter((s) => {
      if (!s.lastSyncSentAt) {
        return true;
      }

      const { seconds } = datetime.difference(s.lastSyncSentAt, new Date(), {
        units: ["seconds"],
      });

      return seconds! >= SyncManager.MIN_SYNC_INTERVAL_SEC;
    });

    return validStates;
  }

  #outdatedStates(): PeerSyncState[] {
    return _internals.getStatesByOutdated(this.#states);
  }

  #statesByChainState(chainState: PeerChainState): PeerSyncState[] {
    return _internals.getStatesByChainSyncState(this.#states, chainState);
  }
}
