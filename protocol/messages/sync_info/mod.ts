import { CursorWriter } from "../../../io/cursor_buffer.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";

export class SyncInfoMessage extends InitialNetworkMessage {
  get code(): MessageCode {
    return MessageCode.SyncInfo;
  }

  get name(): string {
    return "SyncInfo";
  }

  encode(writer: CursorWriter): void {
    throw new Error("Method not implemented.");
  }

  static decode(reader: CursorReader): SyncInfoMessage {
    throw new Error("no impl yet");
  }
}
