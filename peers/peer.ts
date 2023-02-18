import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { EventEmitter } from "../events/mod.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Connection } from "../net/mod.ts";
import { PeerSpec } from "./peer_spec.ts";
import { Handshake, NetworkMessageHandler } from "../protocol/mod.ts";

export interface PeerEvents {
  "io:bytesOut": number;
  "io:bytesIn": number;
}

export interface PeerOpts {
  conn: Connection;
  localSpec: PeerSpec;
  logger: log.Logger;
  handler: NetworkMessageHandler;
}

export class Peer extends EventEmitter<PeerEvents> implements Component {
  readonly #logger: log.Logger;
  readonly #conn: Connection;
  readonly #reader: ReadableStreamDefaultReader<Uint8Array>;
  readonly #writer: WritableStreamDefaultWriter<Uint8Array>;
  readonly #localSpec: PeerSpec;
  readonly #handler: NetworkMessageHandler;
  #lastMsgTimestamp?: number;
  #remoteHandshake?: Handshake;

  constructor({ conn, localSpec, logger, handler }: PeerOpts) {
    super();

    this.#logger = logger;
    this.#conn = conn;
    this.#localSpec = localSpec;
    this.#handler = handler;

    this.#reader = this.#conn.readable.getReader();
    this.#writer = this.#conn.writable.getWriter();
  }

  async start(): Promise<void> {
    await this.#sendHandshake();

    const remoteData = await this.#read();
    const reader = await ScorexReader.create(remoteData);

    this.#remoteHandshake = Handshake.decode(reader);

    this.#logger.debug("received handshake from peer");

    this.#readContinuation();
  }

  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get handshake(): Handshake | undefined {
    return this.#remoteHandshake;
  }

  get lastMsgTimestamp(): number | undefined {
    return this.#lastMsgTimestamp;
  }

  get remoteAddr(): string {
    return this.#conn.remoteAddr.toString();
  }

  send(data: Uint8Array): Promise<void> {
    this.dispatchEvent(
      new CustomEvent("io:bytesOut", { detail: data.byteLength }),
    );

    return this.#writer.write(data);
  }

  async #read(): Promise<Uint8Array> {
    // TODO: handle "done" scenario
    const { value } = await this.#reader.read();

    return value!;
  }

  async #readContinuation(): Promise<void> {
    const data = await this.#read();
    this.#lastMsgTimestamp = Date.now();

    this.dispatchEvent(
      new CustomEvent("io:bytesIn", { detail: data.byteLength }),
    );
    this.#handler.handle(data, this);

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
