import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { NetworkEncodable } from "./encoding.ts";

export class Version implements NetworkEncodable {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  encode(writer: CursorWriter): void {
    writer.putInt8(this.major);
    writer.putInt8(this.minor);
    writer.putInt8(this.patch);
  }

  static decode(reader: CursorReader): Version {
    return new Version(reader.getInt8(), reader.getInt8(), reader.getInt8());
  }
}

// Node application version
export const initialNodeVersion = new Version(0, 0, 1);
