import { CursorWriter } from "../io/cursor_buffer.ts";

export interface NetworkEncodable {
  encode(writer: CursorWriter): void;
}
