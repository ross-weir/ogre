export class MaliciousBehaviourError extends Error {}

export class BadMagicBytesError extends MaliciousBehaviourError {
  magicBytes: Uint8Array;

  constructor(
    magicBytes: Uint8Array,
    ...params: ConstructorParameters<ErrorConstructor>
  ) {
    super(...params);

    this.magicBytes = magicBytes;
  }
}

export class BadLengthError extends MaliciousBehaviourError {
  lengthReceived: number;

  constructor(
    lengthReceived: number,
    ...params: ConstructorParameters<ErrorConstructor>
  ) {
    super(...params);

    this.lengthReceived = lengthReceived;
  }
}

export class InvalidChecksumError extends MaliciousBehaviourError {}
