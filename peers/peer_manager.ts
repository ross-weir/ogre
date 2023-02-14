import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Connection, ConnectionManager } from "../net/mod.ts";
import { Handshake, PeerSpec } from "../protocol/mod.ts";

export interface PeerManagerOpts {
  logger: log.Logger;
  connectionManager: ConnectionManager;
  // our peer spec sent with handshakes to remote peers
  spec: PeerSpec;
}

export class PeerManager implements Component {
  readonly #logger: log.Logger;
  readonly #connectionManager: ConnectionManager;
  readonly #spec: PeerSpec;
  // #peers: Peer[];

  constructor({ logger, connectionManager, spec }: PeerManagerOpts) {
    this.#logger = logger;
    this.#connectionManager = connectionManager;
    this.#spec = spec;

    this.#connectionManager.addEventListener(
      "peer:connect",
      ({ detail }) => this.onConnection(detail),
    );
  }

  async start(): Promise<void> {
  }

  async stop(): Promise<void> {
  }

  private async onConnection(conn: Connection) {
    this.#logger.info(`connection: ${conn.localAddr} -> ${conn.remoteAddr}`);
    this.#logger.info("handshaking...");
    // send handshake
    // wait for handshake
    const reader = conn.readable.getReader();
    const { done, value } = await reader.read();
    const readBuf = await ScorexReader.create(value!);
    const hs = Handshake.decode(readBuf);

    this.#logger.info(
      `peer: ${hs.peerSpec.agentName} with ${hs.peerSpec.features.length} features`,
    );

    const myHs = Handshake.fromCtx({ peerSpec: this.#spec } as any);
    const writer = await ScorexWriter.create();
    myHs.encode(writer);
    conn.writable.getWriter().write(writer.buffer);

    this.#logger.info("handshake established!");
    // add to peers list
    // read all messages
  }
}
