import { Connection } from "../net/mod.ts";
import { PeerSpec } from "../protocol/mod.ts";

export interface PeerOpts {
  conn: Connection;
  spec: PeerSpec;
}

export class Peer {
  #conn: Connection;
  #spec: PeerSpec;

  constructor({ conn, spec }: PeerOpts) {
    this.#conn = conn;
    this.#spec = spec;
  }

  async handshake(): Promise<void> {
  }

  async send(): Promise<void> {}
}
