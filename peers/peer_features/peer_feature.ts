import { CursorWriter } from "../../../io/cursor_buffer.ts";
import { NetworkEncodable } from "../../encoding.ts";

export enum PeerFeatureId {
  LocalAddress = 2,
  SessionId = 3,
  RestApi = 4,
  Mode = 16,
}

export abstract class PeerFeature implements NetworkEncodable {
  abstract get id(): PeerFeatureId;

  abstract encode(writer: CursorWriter): void;
}
