import initWasm, {
  ScorexReader as WasmScorexReader,
  ScorexWriter as WasmScorexWriter,
} from "https://www.unpkg.com/@ergoplatform/scorex-buffer@1.0.0/dist/browser/scorex_buffer.js";
import {
  CursorReader,
  CursorWriter,
  GetOptionFn,
  PutOptionFn,
} from "./cursor_buffer.ts";

// This won't work for bundlers in browser environments most likely, if it works in ESM
// modules maybe only support ESM. If not will need to expose a function like
// "blockUntilWasmLoaded" that resolves when the WASM is loaded.
await initWasm(
  "https://www.unpkg.com/@ergoplatform/scorex-buffer@1.0.0/dist/browser/scorex_buffer_bg.wasm",
);

/**
 * Write data to the underlying buffer in a format used on the Ergo network.
 * Ergo uses zig zag/VLQ encoding.
 */
export class ScorexWriter implements CursorWriter {
  #b: WasmScorexWriter;

  constructor() {
    this.#b = new WasmScorexWriter();
  }

  putInt8(value: number) {
    this.#b.putInt8(value);
  }

  putUint8(value: number) {
    this.#b.putUint8(value);
  }

  putInt16(value: number) {
    this.#b.putInt16(value);
  }

  putUint16(value: number) {
    this.#b.putUint16(value);
  }

  putInt32(value: number) {
    this.#b.putInt32(value);
  }

  putUint32(value: number) {
    this.#b.putUint32(value);
  }

  putInt64(value: bigint) {
    this.#b.putInt64(value);
  }

  putUint64(value: bigint) {
    this.#b.putUint64(value);
  }

  putString(value: string) {
    this.#b.putString(value);
  }

  putOption<T>(
    value: T | undefined,
    fn: PutOptionFn<T>,
  ): void {
    if (!value) {
      this.putUint8(0);
    } else {
      this.putUint8(1);
      fn(this, value);
    }
  }

  putBytes(bytes: Uint8Array): void {
    bytes.forEach((b) => this.putInt8(b));
  }

  get buffer(): Uint8Array {
    return this.#b.buffer;
  }

  newWriter(): CursorWriter {
    return new ScorexWriter();
  }
}

/**
 * Read data from the underlying buffer in a format used on the Ergo network.
 * Ergo uses zig zag/VLQ encoding.
 */
export class ScorexReader implements CursorReader {
  #b: WasmScorexReader;

  constructor(buf: Uint8Array) {
    this.#b = new WasmScorexReader(buf);
  }

  getInt8(): number {
    return this.#b.getInt8();
  }

  getUint8(): number {
    return this.#b.getUint8();
  }

  getInt16(): number {
    return this.#b.getInt16();
  }

  getUint16(): number {
    return this.#b.getUint16();
  }

  getInt32(): number {
    return this.#b.getInt32();
  }

  getUint32(): number {
    return this.#b.getUint32();
  }

  getInt64(): bigint {
    return this.#b.getInt64();
  }

  getUint64(): bigint {
    return this.#b.getUint64();
  }

  getString(): string {
    return this.#b.getString();
  }

  getOption<T>(getter: GetOptionFn<T>): T | undefined {
    return this.getUint8() === 1 ? getter(this) : undefined;
  }

  getBytes(bytesSize: number): Uint8Array {
    const result = new Uint8Array(bytesSize);

    for (let i = 0; i < bytesSize; i += 1) {
      result[i] = this.getUint8();
    }

    return result;
  }

  newReader(buf: Uint8Array): CursorReader {
    return new ScorexReader(buf);
  }

  get buffer(): Uint8Array {
    return this.#b.buffer;
  }
}
