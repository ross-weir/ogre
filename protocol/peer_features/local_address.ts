import { Multiaddr } from "../../deps.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { toMultiaddr } from "../../multiaddr/mod.ts";
import { PeerFeature, PeerFeatureId } from "./feature.ts";

const HOST_LENGTH = 4;

function bytesToIp(bytes: Uint8Array): string {
  return `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}`;
}

function ipToBytes(ip: string) {
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  return new Uint8Array(parts);
}

export class LocalAddressFeature extends PeerFeature {
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

  static decode(reader: CursorReader): LocalAddressFeature {
    const hostBytes = reader.getBytes(HOST_LENGTH);
    const host = bytesToIp(hostBytes);
    const port = reader.getUint32();

    return new LocalAddressFeature(toMultiaddr(`${host}:${port}`));
  }
}
