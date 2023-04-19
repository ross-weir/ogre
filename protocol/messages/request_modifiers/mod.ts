import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { InvPayload } from "../../inv.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";

export class RequestModifiersMessage extends InitialNetworkMessage {
  readonly inv: InvPayload;

  constructor(inv: InvPayload) {
    super();

    this.inv = inv;
  }

  get code(): MessageCode {
    return MessageCode.RequestModifiers;
  }

  get name(): string {
    return "RequestModifiers";
  }

  encode(writer: CursorWriter): void {
    this.inv.encode(writer);
  }

  static decode(reader: CursorReader): RequestModifiersMessage {
    return new RequestModifiersMessage(InvPayload.decode(reader));
  }
}
