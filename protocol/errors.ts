import { OgreError } from "../core/mod.ts";

/** Error raised when malicious peer behaviour is detected. */
export class MaliciousBehaviourError extends OgreError {}

/** Error raised when magic bytes in a network message don't match our configured magic. */
export class BadMagicBytesError extends MaliciousBehaviourError {
  /** The invalid magic bytes received. */
  readonly magicBytes: Uint8Array;

  constructor(
    magicBytes: Uint8Array,
    ...params: ConstructorParameters<ErrorConstructor>
  ) {
    super(...params);

    this.magicBytes = magicBytes;
  }
}

/** Error raised when the length of a message received is invalid. */
export class BadLengthError extends MaliciousBehaviourError {
  /** The invalid length received. */
  readonly lengthReceived: number;

  constructor(
    lengthReceived: number,
    ...params: ConstructorParameters<ErrorConstructor>
  ) {
    super(...params);

    this.lengthReceived = lengthReceived;
  }
}

/**
 * Error raised when the checksum included in a network message
 * for the message body doesn't match the checksum that
 * we calculated for the same body.
 */
export class InvalidChecksumError extends MaliciousBehaviourError {}

export class UnsupportedMessageCodeError extends OgreError {
  readonly messageCode: number;

  constructor(
    messageCode: number,
    ...params: ConstructorParameters<ErrorConstructor>
  ) {
    super(...params);

    this.messageCode = messageCode;
    this.name = "UnsupportedMessageCodeError";
    this.message = `got message code ${this.messageCode}`;
  }
}

/**
 * Error raised when a peer has sent more data than expected.
 * This is classified as malicious because there's a
 * decent chance the peer is trying to DoS the node.
 */
export class UnexpectedDataError extends MaliciousBehaviourError {}
