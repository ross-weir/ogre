import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { NetworkEncodable } from "./encoding.ts";
import { BadLengthError, InvalidChecksumError } from "./errors.ts";
import { initialNodeVersion, Version } from "./version.ts";
import { blakejs } from "../deps.ts";

/** Identifiers for messages that make up the protocol */
export enum MessageCode {
  Handshake = 75,
}

/** Specification of a network message */
export interface NetworkMessageSpec {
  /** Version the message was introduced */
  protocolVersion: Version;
  /** Identifying code of the message */
  code: MessageCode;
  /** Human readable name for the message */
  name: string;
}

export abstract class NetworkMessage
  implements NetworkEncodable, NetworkMessageSpec {
  abstract get protocolVersion(): Version;
  abstract get code(): MessageCode;
  abstract get name(): string;
  abstract encode(writer: CursorWriter): void;
}

/** Network messages that have existed since the initial launch of the network */
export abstract class InitialNetworkMessage extends NetworkMessage {
  get protocolVersion(): Version {
    return initialNodeVersion;
  }
}

function hashesAreEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.every((v, i) => b[i] === v);
}

const MESSAGE_ID_LENGTH = 1;
const MAGIC_BYTES_LENGTH = 4;
const CHECKSUM_LENGTH = 4;
const RAW_HEADER_LENGTH = MESSAGE_ID_LENGTH + MAGIC_BYTES_LENGTH +
  CHECKSUM_LENGTH;

interface RawNetworkMessageParams {
  magicBytes: Uint8Array;
  code: MessageCode;
  bodyLength: number;
  checksum: Uint8Array;
  body: Uint8Array;
}

/**
 * A message received over the network that is yet
 * to be decoded into its concrete message type.
 *
 * Concrete message type is any type of Ergo defined message
 * EXCEPT `Handshake`, handshakes do not follow this encoding
 * format.
 */
export class RawNetworkMessage {
  /** The network magic bytes */
  readonly magicBytes: Uint8Array;
  /** Code of the message contained in `body` */
  readonly code: MessageCode;
  /** The length of the message body - not VLQ or ZigZag encoded */
  readonly bodyLength: number;
  /** blake2b256 checksum of the message body */
  readonly checksum: Uint8Array;
  /** Body of the message - decodes into a concrete message of `code` type */
  readonly body: Uint8Array;

  constructor(
    { magicBytes, code, bodyLength, checksum, body }: RawNetworkMessageParams,
  ) {
    this.magicBytes = magicBytes;
    this.code = code;
    this.bodyLength = bodyLength;
    this.checksum = checksum;
    this.body = body;
  }

  /**
   * Decode bytes received from peer into a `RawNetworkMessage`.
   *
   * This function only performs validation of data absolutely needed
   * for decoding. Additional checks should be done by
   * client code to ensure `magicBytes` are valid, etc.
   *
   * @param reader Reader containing raw bytes received over wire
   * @returns `RawNetworkMessage` instance
   */
  static decode(reader: CursorReader): RawNetworkMessage {
    if (reader.buffer.byteLength < RAW_HEADER_LENGTH) {
      throw new BadLengthError(
        reader.buffer.byteLength,
        "Raw network message length is less than expected header length",
      );
    }

    // This payload is not encoded with VLQ/ZigZag, only the body is
    // due to historical reasons.
    const dv = new DataView(reader.buffer.buffer);
    let dvOffset = 0;

    const magicBytes = new Uint8Array(dv.buffer, dvOffset, MAGIC_BYTES_LENGTH);
    dvOffset += MAGIC_BYTES_LENGTH;

    const code = dv.getInt8(dvOffset);
    dvOffset += 1;

    const bodyLength = dv.getInt32(dvOffset);
    dvOffset += 4;

    if (bodyLength < 0) {
      throw new BadLengthError(
        bodyLength,
        "Body length must be a positive int",
      );
    }

    const checksum = new Uint8Array(dv.buffer, dvOffset, CHECKSUM_LENGTH);
    dvOffset += CHECKSUM_LENGTH;

    const body = new Uint8Array(dv.buffer, dvOffset, bodyLength);
    const actualChecksum = blakejs.blake2b(body, null, 32).slice(
      0,
      CHECKSUM_LENGTH,
    );

    if (!hashesAreEqual(actualChecksum, checksum)) {
      throw new InvalidChecksumError();
    }

    return new RawNetworkMessage({
      magicBytes,
      code,
      bodyLength,
      checksum,
      body,
    });
  }
}
