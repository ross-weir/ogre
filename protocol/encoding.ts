import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";

/** Implementors can be encoded and sent over the wire */
export interface NetworkEncodable {
  /** Encode instance for Ergo network */
  encode(writer: CursorWriter): void;
}

export type DecoderFn<T> = (reader: CursorReader) => T;

/**
 * Decodes & returns many types of `T` using
 * the provided function.
 *
 * @param reader Reader used during decoding
 * @param decoder Function used to decode instances
 * @returns Array of `T`s
 */
export function decodeMany<T>(
  reader: CursorReader,
  decoder: DecoderFn<T>,
): T[] {
  const count = reader.getUint8();
  const result: T[] = [];

  for (let i = 0; i < count; i += 1) {
    result.push(decoder(reader));
  }

  return result;
}

export function bytesToIp(bytes: Uint8Array): string {
  return `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}`;
}

export function ipToBytes(ip: string) {
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  return new Uint8Array(parts);
}
