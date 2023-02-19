import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { PeerFeature, PeerFeatureId } from "./peer_feature.ts";
import {
  LocalAddressPeerFeature,
  ModePeerFeature,
  RestApiPeerFeature,
  SessionIdPeerFeature,
} from "./mod.ts";

/** Decodes bytes into a concrete `PeerFeature` based on the supplied feature id. */
export function decodePeerFeature(reader: CursorReader): PeerFeature {
  const featureId = reader.getInt8();
  const featureSize = reader.getUint16();
  const featureBytes = reader.getBytes(featureSize);
  const newReader = reader.newReader(featureBytes);

  switch (featureId) {
    case PeerFeatureId.Mode:
      return ModePeerFeature.decode(newReader);
    case PeerFeatureId.LocalAddress:
      return LocalAddressPeerFeature.decode(newReader);
    case PeerFeatureId.SessionId:
      return SessionIdPeerFeature.decode(newReader);
    case PeerFeatureId.RestApi:
      return RestApiPeerFeature.decode(newReader);
    default:
      throw new Error(`unsupported peer feature id '${featureId}'`);
  }
}

/** Encode a `PeerFeature` so it can be sent to peers. */
export function encodePeerFeature(writer: CursorWriter, pf: PeerFeature): void {
  writer.putInt8(pf.id);

  const newWriter = writer.newWriter();

  pf.encode(newWriter);

  const featureBytes = newWriter.buffer;

  writer.putUint16(featureBytes.byteLength);
  writer.putBytes(featureBytes);
}
