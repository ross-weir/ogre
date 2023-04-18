import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { Serializer } from "./serializer.ts";
import {
  CurvePoint,
  GROUP_ELEMENT_ENCODED_SIZE,
  GROUP_ELEMENT_IDENTITY,
  ICurvePoint,
} from "../../crypto/mod.ts";

export class GroupElementSerializer extends Serializer<ICurvePoint> {
  serialize(writer: CursorWriter, obj: ICurvePoint): void {
    const bytes = obj.equals(GROUP_ELEMENT_IDENTITY)
      ? new Uint8Array(GROUP_ELEMENT_ENCODED_SIZE)
      : obj.toRawBytes(true);

    writer.putBytes(bytes);
  }

  deserialize(reader: CursorReader): ICurvePoint {
    const encodedPoint = reader.getBytes(GROUP_ELEMENT_ENCODED_SIZE);

    return encodedPoint[0] === 0
      ? GROUP_ELEMENT_IDENTITY
      : CurvePoint.fromHex(encodedPoint);
  }
}
