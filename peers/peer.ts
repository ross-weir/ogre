import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { EventEmitter } from "../events/mod.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Connection } from "../net/mod.ts";
import { Handshake, NetworkMessageHandler, PeerSpec } from "../protocol/mod.ts";

/** Events emitted by `Peer`s. */
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

/** Wraps a connection to a peer and handles message sending/receiving. */
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
    return Promise.resolve();
  }

  /**
   * `Handshake` received from the remote peer.
   *
   * Returns `undefined` if we are yet to receive a handshake
   * from the peer.
   */
  get handshake(): Handshake | undefined {
    return this.#remoteHandshake;
  }

  /**
   * Unix timestamp of the last message received from the remote peer.
   *
   * Returns` undefined` if the peer is yet to send a message.
   */
  get lastMsgTimestamp(): number | undefined {
    return this.#lastMsgTimestamp;
  }

  /** Address of the remote peer in `Multiaddr` formatting. */
  get remoteAddr(): string {
    return this.#conn.remoteAddr.toString();
  }

  /** Send data to the remote peer. */
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
