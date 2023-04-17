import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";

export abstract class Serializer<T> {
  abstract serialize(writer: CursorWriter, obj: T): void;
  abstract deserialize(reader: CursorReader): T;
}
