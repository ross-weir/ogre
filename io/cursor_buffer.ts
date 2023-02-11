export interface CursorWriter {
  putInt8(value: number): void;

  putUint8(value: number): void;

  putInt16(value: number): void;

  putUint16(value: number): void;

  putInt32(value: number): void;

  putUint32(value: number): void;

  putInt64(value: bigint): void;

  putUint64(value: bigint): void;

  putString(value: string): void;

  get buffer(): Uint8Array;
}

export interface CursorReader {
  getInt8(): number;

  getUint8(): number;

  getInt16(): number;

  getUint16(): number;

  getInt32(): number;

  getUint32(): number;

  getInt64(): bigint;

  getUint64(): bigint;

  getString(): string;

  get buffer(): Uint8Array;
}
