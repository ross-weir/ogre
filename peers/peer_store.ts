import { Component } from "../core/component.ts";
import { log, Multiaddr, multiaddr } from "../deps.ts";
import { PeerSpec } from "./peer_spec.ts";

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

  add(addr: Multiaddr) {
    // TODO: don't add self
    this.#logger.debug(`adding ${addr.toString()} to address book`);

    this.#userProvidedAddrs.push(addr);
  }

  exists(peer: PeerSpec) {
    // return !!this.#peerSpecs.find(p => p.address === peer.address) where address is "declared address" or local address
  }

  get addrs(): Multiaddr[] {
    return this.#userProvidedAddrs;
  }

  async start(): Promise<void> {
    // TODO load more peers from database
  }

  async stop(): Promise<void> {
    // TODO save peers to database
  }
}
