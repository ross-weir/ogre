import { Component } from "../core/component.ts";
import { log, Multiaddr, multiaddr } from "../deps.ts";

export interface PeerAddressBookOpts {
  logger: log.Logger;
  configAddrs: string[];
}

export class PeerAddressBook implements Component {
  readonly #logger: log.Logger;
  readonly #peerAddrs: Set<Multiaddr>;

  /**
   * Create a new PeerAddressBook instance
   *
   * @param configAddrs known addresses defined in the ergode configuration or supplied by user
   */
  constructor({ logger, configAddrs }: PeerAddressBookOpts) {
    this.#logger = logger;
    this.#peerAddrs = new Set(configAddrs.map(multiaddr));
  }

  add(addr: Multiaddr) {
    this.#logger.debug(`adding ${addr.toString()} to address book`);

    this.#peerAddrs.add(addr);
  }

  get addrs(): Multiaddr[] {
    return Array.from(this.#peerAddrs);
  }

  start(): Promise<void> {
    // TODO load more peers from database
    throw new Error("Method not implemented.");
  }

  stop(): Promise<void> {
    // TODO save peers to database
    throw new Error("Method not implemented.");
  }
}
