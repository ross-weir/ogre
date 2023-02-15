import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Connection } from "../net/mod.ts";
import { Handshake, PeerSpec } from "../protocol/mod.ts";

export interface PeerOpts {
  conn: Connection;
  localSpec: PeerSpec;
  logger: log.Logger;
}

export class Peer implements Component {
  readonly #logger: log.Logger;
  readonly #conn: Connection;
  readonly #reader: ReadableStreamDefaultReader<Uint8Array>;
  readonly #writer: WritableStreamDefaultWriter<Uint8Array>;
  readonly #localSpec: PeerSpec;
  #remoteHandshake?: Handshake;

  constructor({ conn, localSpec, logger }: PeerOpts) {
    this.#logger = logger;
    this.#conn = conn;
    this.#localSpec = localSpec;

    this.#reader = this.#conn.readable.getReader();
    this.#writer = this.#conn.writable.getWriter();
  }

  async start(): Promise<void> {
    this.#sendHandshake();

    const remoteData = await this.#read();
    const reader = await ScorexReader.create(remoteData);

    this.#remoteHandshake = Handshake.decode(reader);

    this.#logger.debug("received handshake from peer");

    this.#readContinuation();
  }

  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  send(data: Uint8Array): Promise<void> {
    return this.#writer.write(data);
  }

  async #read(): Promise<Uint8Array> {
    const { done, value } = await this.#reader.read();

    return value!;
  }

  async #readContinuation(): Promise<void> {
    const data = await this.#read();

    this.#logger.debug("readContinuation data");
    this.#logger.debug(data);
    // handle msg

    return this.#readContinuation();
  }

  async #sendHandshake(): Promise<void> {
    this.#logger.debug("handshaking peer");

    const hs = Handshake.withSpec(this.#localSpec);
    const writer = await ScorexWriter.create();

    hs.encode(writer);
    this.send(writer.buffer);
  }
}
