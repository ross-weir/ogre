import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { Connection } from "../net/mod.ts";
import {
  GetPeersMessage,
  NetworkMessageCodec,
  PeerSpec,
} from "../protocol/mod.ts";
import { Peer } from "./peer.ts";
import { peersQuery } from "./peers_query.ts";

/** The reason why a peer was removed by the PeerManager. */
export enum PeerRemovalReason {
  Disconnect,
  Evicted,
}

export interface PeerManagerEvents {
  "peer:new": CustomEvent<Peer>;
  "peer:removed": CustomEvent<{ peer: Peer; reason: PeerRemovalReason }>;
}

export interface PeerManagerOpts {
  logger: log.Logger;
  // our peer spec sent with handshakes to remote peers
  spec: PeerSpec;
  codec: NetworkMessageCodec;
  gossipIntervalSecs: number;
  evictIntervalSecs: number;
}

export class PeerManager extends Component<PeerManagerEvents> {
  readonly #logger: log.Logger;
  readonly #spec: PeerSpec;
  readonly #codec: NetworkMessageCodec;
  readonly #peers: Peer[] = [];
  #getPeersTaskHandle?: number;
  #gossipIntervalSecs: number;
  #evictPeersTaskHandle?: number;
  #evictIntervalSecs: number;

  constructor(
    {
      logger,
      spec,
      codec,
      gossipIntervalSecs,
      evictIntervalSecs,
    }: PeerManagerOpts,
  ) {
    super();

    this.#logger = logger;
    this.#spec = spec;
    this.#codec = codec;
    this.#gossipIntervalSecs = gossipIntervalSecs;
    this.#evictIntervalSecs = evictIntervalSecs;
  }

  start(): Promise<void> {
    this.#getPeersTaskHandle = setInterval(
      () => this.gossipPeers(),
      this.#gossipIntervalSecs * 1000,
    );
    this.#evictPeersTaskHandle = setInterval(
      () => this.evictPeer(),
      this.#evictIntervalSecs * 1000,
    );

    return Promise.resolve();
  }

  stop(): Promise<void> {
    clearInterval(this.#getPeersTaskHandle);
    clearInterval(this.#evictPeersTaskHandle);

    return Promise.resolve();
  }

  /**
   * Select a random peer from our currently connected peers to send
   * a `GetPeersMessage` message to. This enables us to gossip and
   * build up a list of peers.
   *
   * This function likely won't need to be called manually and will
   * be ran at an interval defined by `gossipIntervalSecs` to gather peers.
   */
  gossipPeers() {
    const msg = new GetPeersMessage();
    const peer = peersQuery(this.#peers).canHandle(msg).randomize().peers()[0];

    if (!peer) {
      this.#logger.debug("Unable to find suitable peer for 'GetPeers' request");

      return;
    }

    peer.send(msg);
  }

  async evictPeer() {
    const peer = peersQuery(this.#peers).randomize().peers()[0];

    if (!peer) {
      this.#logger.debug("evictPeer found no peer to remove");

      return;
    }

    this.#logger.debug(`Evicting random peer: ${peer.remoteAddr}`);

    this.dispatchEvent(
      new CustomEvent("peer:removed", {
        detail: { peer, reason: PeerRemovalReason.Evicted },
      }),
    );

    await peer.stop();
  }

  acceptConnection(conn: Connection) {
    this.#logger.info(`connection: ${conn.localAddr} -> ${conn.remoteAddr}`);

    const peer = new Peer({
      conn,
      localSpec: this.#spec,
      logger: this.#logger,
      codec: this.#codec,
    });

    this.#peers.push(peer);
    this.dispatchEvent(new CustomEvent("peer:new", { detail: peer }));
    peer.start();
  }
}
