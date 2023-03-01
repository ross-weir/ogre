import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import {
  CHECKSUM_LENGTH,
  MessageCode,
  NetworkMessage,
  RawNetworkMessage,
} from "./message.ts";
import { blakejs } from "../deps.ts";
import { isBytesEq } from "../_utils/mod.ts";
import { BadMagicBytesError, UnsupportedMessageCodeError } from "./errors.ts";
import { GetPeersMessage, PeersMessage } from "./messages/mod.ts";
import { Component } from "../core/component.ts";

/** Encapsulates encoding/decoding of raw network messages. */
export interface NetworkMessageCodec {
  /**
   * Encodes a message in the expected format so it
   * can be sent over the wire. This includes
   * adding the message header, etc.
   * @param msg Network message to encode.
   * @returns Encoded message bytes.
   */
  encode(msg: NetworkMessage): Uint8Array;
  /**
   * Decodes the provided data from the network format
   * into a network message. This includes parsing
   * the message header and validation.
   *
   * @param data Data to decode into a network message.
   * @returns Decoded network message.
   */
  decode(data: Uint8Array): NetworkMessage;

  newReader(buf: Uint8Array): CursorReader;
  newWriter(): CursorWriter;
}

export class DefaultNetworkMessageCodec extends Component
  implements NetworkMessageCodec {
  readonly #magicBytes: Uint8Array;
  #reader?: CursorReader;
  #writer?: CursorWriter;

  constructor(
    magicBytes: Uint8Array,
  ) {
    super();
    this.#magicBytes = magicBytes;
  }

  newWriter(): CursorWriter {
    return this.#writer!.newWriter();
  }

  newReader(buf: Uint8Array): CursorReader {
    return this.#reader!.newReader(buf);
  }

  encode(msg: NetworkMessage): Uint8Array {
    const writer = this.#writer!.newWriter();
    msg.encode(writer);
    const body = writer.buffer;
    const checksum = blakejs.blake2b(body, null, 32).slice(
      0,
      CHECKSUM_LENGTH,
    );

    return new RawNetworkMessage({
      magicBytes: this.#magicBytes,
      code: msg.code,
      bodyLength: body.byteLength,
      checksum,
      body,
    }).encode();
  }

  decode(msg: Uint8Array): NetworkMessage {
    const reader = this.#reader!.newReader(msg);
    const decodedMsg = RawNetworkMessage.decode(reader);

    if (!isBytesEq(decodedMsg.magicBytes, this.#magicBytes)) {
      throw new BadMagicBytesError(decodedMsg.magicBytes);
    }

    const bodyReader = this.#reader!.newReader(decodedMsg.body);

    switch (decodedMsg.code) {
      case MessageCode.GetPeers:
        return GetPeersMessage.decode(bodyReader);
      case MessageCode.Peers:
        return PeersMessage.decode(bodyReader);
      default:
        throw new UnsupportedMessageCodeError(decodedMsg.code);
    }
  }

  async beforeStart(): Promise<void> {
    this.#reader = await ScorexReader.create(new Uint8Array());
    this.#writer = await ScorexWriter.create();
  }
}
