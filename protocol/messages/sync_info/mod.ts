import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { InitialNetworkMessage, MessageCode } from "../../message.ts";
import { SyncInfoType, SyncInfoV1, SyncInfoV2 } from "../../sync_info.ts";

function isV2Message(buf: Uint8Array): boolean {
  return buf[0] === 0 && buf.byteLength > 1;
}

export class SyncInfoMessage extends InitialNetworkMessage {
  readonly syncInfo: SyncInfoType;

  constructor(syncInfo: SyncInfoType) {
    super();

    this.syncInfo = syncInfo;
  }

  get code(): MessageCode {
    return MessageCode.SyncInfo;
  }

  get name(): string {
    return "SyncInfo";
  }

  encode(writer: CursorWriter): void {
    this.syncInfo.encode(writer);
  }

  static decode(reader: CursorReader): SyncInfoMessage {
    const syncInfo = isV2Message(reader.buffer)
      ? SyncInfoV2.decode(reader)
      : SyncInfoV1.decode(reader);

    return new SyncInfoMessage(syncInfo);
  }
}
