import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { PeerFeature, PeerFeatureId } from "./feature.ts";
import { LocalAddressFeature } from "./local_address.ts";
import { ModePeerFeature } from "./mode.ts";

export function decodePeerFeature(reader: CursorReader): PeerFeature {
  const featureId = reader.getInt8();
  const featureSize = reader.getUint16();
  const featureBytes = reader.getBytes(featureSize);
  const newReader = reader.newReader(featureBytes);

  switch (featureId) {
    case PeerFeatureId.Mode:
      return ModePeerFeature.decode(newReader);
    case PeerFeatureId.LocalAddress:
      return LocalAddressFeature.decode(newReader);
    default:
      throw new Error(`unsupported peer feature id '${featureId}'`);
  }
}

export function encodePeerFeature(writer: CursorWriter, pf: PeerFeature): void {
  writer.putInt8(pf.id);

  const newWriter = writer.newWriter();

  pf.encode(newWriter);

  const featureBytes = newWriter.buffer;

  writer.putUint16(featureBytes.byteLength);
  writer.putBytes(featureBytes);
}
