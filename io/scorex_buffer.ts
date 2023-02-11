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

let _wasm = false;

async function instantiateWasm(): Promise<void> {
  if (!_wasm) {
    _wasm = true;

    return await initWasm();
  }
}

/**
 * Write data to the underlying buffer in a format used on the Ergo network.
 * Ergo uses zig zag/VLQ encoding.
 */
export class ScorexWriter implements CursorWriter {
  #b: WasmScorexWriter;

  private constructor(writer: WasmScorexWriter) {
    this.#b = writer;
  }

  static async create(): Promise<ScorexWriter> {
    await instantiateWasm();

    return new ScorexWriter(new WasmScorexWriter());
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

  get buffer(): Uint8Array {
    return this.#b.buffer;
  }
}

/**
 * Read data from the underlying buffer in a format used on the Ergo network.
 * Ergo uses zig zag/VLQ encoding.
 */
export class ScorexReader implements CursorReader {
  #b: WasmScorexReader;

  private constructor(reader: WasmScorexReader) {
    this.#b = reader;
  }

  static async create(buf: Uint8Array): Promise<ScorexReader> {
    await instantiateWasm();

    return new ScorexReader(new WasmScorexReader(buf));
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

  newReader(buf: Uint8Array): CursorReader {
    return new ScorexReader(new WasmScorexReader(buf));
  }

  get buffer(): Uint8Array {
    return this.#b.buffer;
  }
}
