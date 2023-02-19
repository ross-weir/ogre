import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { PeerFeature, PeerFeatureId } from "./peer_feature.ts";

export class RestApiPeerFeature extends PeerFeature {
  readonly url: URL;

  constructor(url: URL) {
    super();

    this.url = url;
  }

  get id(): PeerFeatureId {
    return PeerFeatureId.RestApi;
  }

  encode(writer: CursorWriter): void {
    // remove the trailing slash to be consistent with ref client
    // and save space
    const urlStr = this.url.toString().replace(/\/$/, "");
    const urlBytes = new TextEncoder().encode(urlStr);

    writer.putUint8(urlBytes.byteLength);
    writer.putBytes(urlBytes);
  }

  static decode(reader: CursorReader): RestApiPeerFeature {
    const urlLen = reader.getUint8();
    const urlBytes = reader.getBytes(urlLen);
    const url = new TextDecoder().decode(urlBytes);

    return new RestApiPeerFeature(new URL(url));
  }
}
