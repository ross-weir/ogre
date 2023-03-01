import { Component } from "../core/component.ts";
import { log } from "../deps.ts";
import { Connection } from "../net/mod.ts";
import { NetworkMessage } from "../protocol/message.ts";
import {
  HandshakeMessage,
  NetworkMessageCodec,
  PeerSpec,
} from "../protocol/mod.ts";

/** Events emitted by `Peer`s. */
export interface PeerEvents {
  "message:data": CustomEvent<Uint8Array>;
  "message:recv": CustomEvent<NetworkMessage>;
}

export interface PeerOpts {
  conn: Connection;
  localSpec: PeerSpec;
  logger: log.Logger;
  codec: NetworkMessageCodec;
}

/** Wraps a connection to a peer and handles message sending/receiving. */
export class Peer extends Component<PeerEvents> {
  readonly #logger: log.Logger;
  readonly #conn: Connection;
  readonly #reader: ReadableStreamDefaultReader<Uint8Array>;
  readonly #writer: WritableStreamDefaultWriter<Uint8Array>;
  readonly #localSpec: PeerSpec;
  readonly #codec: NetworkMessageCodec;
  #lastMsgTimestamp?: number;
  #remoteHandshake?: HandshakeMessage;

  constructor({ conn, localSpec, logger, codec }: PeerOpts) {
    super();

    this.#logger = logger;
    this.#conn = conn;
    this.#localSpec = localSpec;
    this.#codec = codec;

    this.#reader = this.#conn.readable.getReader();
    this.#writer = this.#conn.writable.getWriter();
  }

  async start(): Promise<void> {
    await this.#sendHandshake();

    const remoteData = await this.#read();
    const reader = this.#codec.newReader(remoteData);

    this.#remoteHandshake = HandshakeMessage.decode(reader);

    this.#logger.debug("received handshake from peer");

    this.#readContinuation();
  }

  /**
   * `Handshake` received from the remote peer.
   *
   * Returns `undefined` if we are yet to receive a handshake
   * from the peer.
   */
  get handshake(): HandshakeMessage | undefined {
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
  send(msg: NetworkMessage): Promise<void> {
    this.#logger.debug(`Sending ${msg.name} message to peer`);

    const data = this.#codec.encode(msg);

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
      new CustomEvent("message:data", { detail: data }),
    );

    // TODO: catch errors and raise, handle misbehaving peer errors in peer manager
    const msg = this.#codec.decode(data);

    this.dispatchEvent(
      new CustomEvent("message:recv", { detail: msg }),
    );

    return this.#readContinuation();
  }

  #sendHandshake(): Promise<void> {
    this.#logger.debug("handshaking peer");

    const hs = HandshakeMessage.withSpec(this.#localSpec);
    const writer = this.#codec.newWriter();

    hs.encode(writer);

    return this.#writer.write(writer.buffer);
  }
}
