import { CursorReader, CursorWriter } from "../io/cursor_buffer.ts";
import { isSemVer } from "../_utils/isSemVer.ts";
import { semver } from "../deps.ts";
import { NetworkEncodable } from "./encoding.ts";

function ensureString(ver: Version | string): string {
  return ver instanceof Version ? ver.toString() : ver;
}

/** Represents a version of an entity on the network. */
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

  gte(other: Version | string): boolean {
    return semver.gte(this.toString(), ensureString(other));
  }

  static decode(reader: CursorReader): Version {
    return new Version(reader.getInt8(), reader.getInt8(), reader.getInt8());
  }

  /** Convert the version to a string in semantic format. */
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  /**
   * Create a `Version` from the provided string.
   *
   * @param s String in semantic version formatting.
   * @returns `Version` instance.
   */
  static fromString(s: string): Version {
    if (!isSemVer(s)) {
      throw new Error(`must be semantic version formatting, received: ${s}`);
    }

    const [major, minor, patch] = s.split(".").map(Number);

    return new Version(major, minor, patch);
  }
}
