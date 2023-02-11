import { CursorWriter } from "../../io/cursor_buffer.ts";
import { NetworkEncodable } from "../encoding.ts";
import { initialProtocolVersion, Version } from "../version.ts";

export enum MessageCode {
  Handshake = 75,
}

export interface NetworkMessageSpec {
  protocolVersion: Version;
  code: MessageCode;
  name: string;
}

export abstract class NetworkMessage
  implements NetworkEncodable, NetworkMessageSpec {
  abstract get protocolVersion(): Version;
  abstract get code(): MessageCode;
  abstract get name(): string;
  abstract encode(writer: CursorWriter): void;
}

export abstract class InitialNetworkMessage extends NetworkMessage {
  get protocolVersion(): Version {
    return initialProtocolVersion;
  }
}
