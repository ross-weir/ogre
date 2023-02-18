import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { isSemVer } from "../_utils/isSemVer.ts";
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

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  static fromString(s: string): Version {
    if (!isSemVer(s)) {
      throw new Error(`must be semantic version formatting, received: ${s}`);
    }

    const [major, minor, patch] = s.split(".").map(Number);

    return new Version(major, minor, patch);
  }
}

// Node application version
export const initialNodeVersion = new Version(0, 0, 1);
