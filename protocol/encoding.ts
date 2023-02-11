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
