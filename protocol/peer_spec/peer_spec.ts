import { OgreConfig } from "../../config/mod.ts";
import { Multiaddr, multiaddr } from "../../deps.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import {
  bytesToIp,
  decodeMany,
  ipToBytes,
  NetworkEncodable,
} from "../encoding.ts";
import {
  createFeaturesFromConfig,
  decodePeerFeature,
  encodePeerFeature,
  LocalAddressPeerFeature,
  PeerFeature,
  PeerFeatureId,
} from "./peer_features/mod.ts";
import { Version } from "../version.ts";
import { toMultiaddr } from "../../multiaddr/mod.ts";

export interface PeerSpecOpts {
  agentName: string;
  refNodeVersion: Version;
  nodeName: string;
  declaredAddress?: Multiaddr;
  features: PeerFeature[];
}

export class PeerSpec implements NetworkEncodable {
  readonly agentName: string;
  readonly refNodeVersion: Version;
  readonly nodeName: string;
  readonly declaredAddress?: Multiaddr;
  readonly features: PeerFeature[];

  constructor(
    { agentName, refNodeVersion, nodeName, declaredAddress, features }:
      PeerSpecOpts,
  ) {
    this.agentName = agentName;
    this.refNodeVersion = refNodeVersion;
    this.nodeName = nodeName;
    this.declaredAddress = declaredAddress;
    this.features = features;
  }

  /**
   * Get the address for the `PeerSpec`.
   * Defaults to the `declaredAddress` and falls back
   * to the `LocalAddressPeerFeature` address if the feature
   * is defined.
   */
  get addr() {
    const localAddrFeature = this.features.find((f) =>
      f.id === PeerFeatureId.LocalAddress
    );

    return this.declaredAddress ||
      (localAddrFeature as LocalAddressPeerFeature).addr;
  }

  encode(writer: CursorWriter): void {
    writer.putString(this.agentName);
    this.refNodeVersion.encode(writer);
    writer.putString(this.nodeName);
    writer.putOption(this.declaredAddress, (w, addr) => {
      const { host, port } = addr.toOptions();
      const ipBytes = ipToBytes(host);

      // host byte length + port length
      w.putUint8(ipBytes.byteLength + 4);
      w.putBytes(ipBytes);
      w.putUint32(port);
    });
    writer.putUint8(this.features.length);
    this.features.forEach((f) => encodePeerFeature(writer, f));
  }

  static decode(reader: CursorReader): PeerSpec {
    const agentName = reader.getString();
    const refNodeVersion = Version.decode(reader);
    const nodeName = reader.getString();
    const declaredAddress = reader.getOption<Multiaddr>((r) => {
      const hostLen = r.getUint8();
      const hostBytes = r.getBytes(hostLen - 4);
      const port = r.getUint32();
      const hostIp = bytesToIp(hostBytes);

      return toMultiaddr(`${hostIp}:${port}`);
    });
    const features = decodeMany(reader, decodePeerFeature);

    return new PeerSpec({
      agentName,
      refNodeVersion,
      nodeName,
      declaredAddress,
      features,
    });
  }

  static fromConfig(cfg: OgreConfig): PeerSpec {
    const { p2p } = cfg;
    const { declaredAddress } = cfg.network;

    return new PeerSpec({
      agentName: p2p.agentName,
      refNodeVersion: Version.fromString(p2p.refNodeVersion),
      nodeName: p2p.nodeName,
      features: createFeaturesFromConfig(cfg),
      declaredAddress: declaredAddress ? multiaddr(declaredAddress) : undefined,
    });
  }
}
