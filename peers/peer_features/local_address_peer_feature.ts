import { Multiaddr } from "../../deps.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { toMultiaddr } from "../../multiaddr/mod.ts";
import { bytesToIp, ipToBytes } from "../../protocol/encoding.ts";
import { PeerFeature, PeerFeatureId } from "./peer_feature.ts";

const HOST_LENGTH = 4;

export class LocalAddressPeerFeature extends PeerFeature {
  readonly addr: Multiaddr;

  constructor(addr: Multiaddr) {
    super();

    this.addr = addr;
  }

  get id(): PeerFeatureId {
    return PeerFeatureId.LocalAddress;
  }

  encode(writer: CursorWriter): void {
    const { host, port } = this.addr.toOptions();

    writer.putBytes(ipToBytes(host));
    writer.putUint32(port);
  }

  static decode(reader: CursorReader): LocalAddressPeerFeature {
    const hostBytes = reader.getBytes(HOST_LENGTH);
    const host = bytesToIp(hostBytes);
    const port = reader.getUint32();

    return new LocalAddressPeerFeature(toMultiaddr(`${host}:${port}`));
  }
}
