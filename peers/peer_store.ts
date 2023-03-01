import { Component } from "../core/component.ts";
import { log, Multiaddr, multiaddr } from "../deps.ts";
import { PeerSpec } from "../protocol/peer_spec/mod.ts";

export interface PeerStoreOpts {
  logger: log.Logger;
  configAddrs: string[];
}

export class PeerStore extends Component {
  readonly #logger: log.Logger;
  readonly #userProvidedAddrs: Multiaddr[];
  readonly #peerSpecs: PeerSpec[] = [];

  /**
   * Create a new PeerStore instance.
   *
   * @param configAddrs known addresses defined in the ergode configuration or supplied by user
   */
  constructor({ logger, configAddrs }: PeerStoreOpts) {
    super();

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

  /**
   * Returns an array of all addresses known.
   *
   * This includes user provided bootstrap addresses in the configuration
   * and addresses from `PeerSpec`s received from peers
   * on the network.
   */
  get addrs(): Multiaddr[] {
    const result = [];

    result.push(...this.#peerSpecs.map((p) => p.addr));

    for (const addr of this.#userProvidedAddrs) {
      const existing = !!result.find((a) => a.equals(addr));

      if (!existing) {
        result.push(addr);
      }
    }

    return result;
  }

  get peerSpecs(): PeerSpec[] {
    return this.#peerSpecs;
  }

  #exists(peer: PeerSpec) {
    return !!this.#peerSpecs.find((p) => p.addr.equals(peer.addr));
  }

  async start(): Promise<void> {
    // TODO load more peers from database
  }

  async stop(): Promise<void> {
    // TODO save peers to database
  }
}
