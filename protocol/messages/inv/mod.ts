import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { InvPayload } from "../../inv.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";

export class InvMessage extends InitialNetworkMessage {
  readonly inv: InvPayload;

  constructor(inv: InvPayload) {
    super();

    this.inv = inv;
  }

  get code(): MessageCode {
    return MessageCode.Inv;
  }

  get name(): string {
    return "Inv";
  }

  encode(writer: CursorWriter): void {
    this.inv.encode(writer);
  }

  static decode(reader: CursorReader): InvMessage {
    const inv = InvPayload.decode(reader);

    return new InvMessage(inv);
  }
}
