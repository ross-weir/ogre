import { Component } from "../core/component.ts";
import { log, Multiaddr, multiaddr } from "../deps.ts";
import { PeerSpec } from "../protocol/peer_spec/mod.ts";

export interface PeerStoreOpts {
  logger: log.Logger;
  configAddrs: string[];
}

export class PeerStore implements Component {
  readonly #logger: log.Logger;
  readonly #userProvidedAddrs: Multiaddr[];
  readonly #peerSpecs: PeerSpec[] = [];

  /**
   * Create a new PeerStore instance.
   *
   * @param configAddrs known addresses defined in the ergode configuration or supplied by user
   */
  constructor({ logger, configAddrs }: PeerStoreOpts) {
    this.#logger = logger;
    this.#userProvidedAddrs = configAddrs.map(multiaddr);
  }

  /**
   * Add the provided peer spec to the store.
   * No-op if the peer spec already exists.
   *
   * @param peerSpec Spec to add to the store.
   */
  add(peerSpec: PeerSpec) {
    if (this.#exists(peerSpec)) {
      this.#logger.debug("Peer spec already exists");

      return;
    }

    this.#peerSpecs.push(peerSpec);
  }

  get addrs(): Multiaddr[] {
    const specAddrs = this.#peerSpecs.map((p) => p.addr);
    const uniqueAddrs = new Set([...specAddrs, ...this.#userProvidedAddrs]);

    return Array.from(uniqueAddrs);
  }

  #exists(peer: PeerSpec) {
    return !!this.#peerSpecs.find((p) => p.addr === peer.addr);
  }

  async start(): Promise<void> {
    // TODO load more peers from database
  }

  async stop(): Promise<void> {
    // TODO save peers to database
  }
}
