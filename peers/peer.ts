import { Component } from "../core/component.ts";
import { IdentifiableMixin } from "../core/mod.ts";
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
  "peer:data:recv": CustomEvent<Uint8Array>;
  "peer:data:send": CustomEvent<Uint8Array>;
  "peer:message:recv": CustomEvent<NetworkMessage>;
  "peer:message:send": CustomEvent<NetworkMessage>;
  "peer:stopped": CustomEvent;
}

export interface PeerOpts {
  conn: Connection;
  localSpec: PeerSpec;
  logger: log.Logger;
  codec: NetworkMessageCodec;
}

/** Wraps a connection to a peer and handles message sending/receiving. */
class BasePeer extends Component<PeerEvents> {
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

    this.dispatchEvent(
      new CustomEvent("peer:message:recv", { detail: this.#remoteHandshake }),
    );

    this.#logger.debug("received handshake from peer");

    this.#readContinuation();
  }

  stop(): Promise<void> {
    // TODO: abort current read op
    this.#conn.close();

    this.dispatchEvent(new CustomEvent("peer:stopped"));

    return Promise.resolve();
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
   * Returns `undefined` if the peer is yet to send a message.
   */
  get lastMsgTimestamp(): number | undefined {
    return this.#lastMsgTimestamp;
  }

  /** Address of the remote peer in `Multiaddr` formatting. */
  get remoteAddr(): string {
    return this.#conn.remoteAddr.toString();
  }

  /** The ID of the `Connection` associated with this peer. */
  get connId(): string {
    return this.#conn.connId;
  }

  /** Send data to the remote peer. */
  send(msg: NetworkMessage): Promise<void> {
    this.#logger.debug(`Sending ${msg.name} message to peer`);

    this.dispatchEvent(new CustomEvent("peer:message:send", { detail: msg }));

    const data = this.#codec.encode(msg);

    this.dispatchEvent(new CustomEvent("peer:data:send", { detail: data }));

    return this.#writer.write(data);
  }

  /** Check if this peer is equal to the provided peer. */
  isEqual(other: Peer): boolean {
    return this.remoteAddr === other.remoteAddr;
  }

  async #read(): Promise<Uint8Array> {
    // TODO: handle "done" scenario
    try {
      const { value } = await this.#reader.read();

      return value!;
    } catch {
      // for Deno based streams it can throw a Deno.errors.Interrupted
      // should instead raise a common error type between deno and bridges
      return new Uint8Array();
    }
  }

  async #readContinuation(): Promise<void> {
    const data = await this.#read();

    if (!data.length) {
      return;
    }

    this.#lastMsgTimestamp = Date.now();

    this.dispatchEvent(
      new CustomEvent("peer:data:recv", { detail: data }),
    );

    // TODO: catch errors and raise, handle misbehaving peer errors in peer manager
    try {
      const msg = this.#codec.decode(data);

      this.dispatchEvent(
        new CustomEvent("peer:message:recv", { detail: msg }),
      );
    } catch (e) {
      // currently we get decode errors for common messages
      // that we haven't implemented decoding for yet.
      this.#logger.info(e.toString());
    }

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

export class Peer extends IdentifiableMixin(BasePeer) {}
