import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";

export interface NetworkEncodable {
  encode(writer: CursorWriter): void;
}

export type DecoderFn<T> = (reader: CursorReader) => T;

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
