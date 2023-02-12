import { ErgodeConfig } from "../../../config/mod.ts";
import { Multiaddr, multiaddr } from "../../../deps.ts";
import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { decodeMany, NetworkEncodable } from "../../encoding.ts";
import {
  decodePeerFeature,
  encodePeerFeature,
} from "../../peer_features/encoding.ts";
import { PeerFeature } from "../../peer_features/feature.ts";
import { Version } from "../../version.ts";

export interface PeerSpecOpts {
  agentName: string;
  protocolVersion: Version;
  nodeName: string;
  declaredAddress?: Multiaddr;
  features: PeerFeature[];
}

export class PeerSpec implements NetworkEncodable {
  readonly agentName: string;
  readonly protocolVersion: Version;
  readonly nodeName: string;
  readonly declaredAddress?: Multiaddr;
  readonly features: PeerFeature[];

  constructor(
    { agentName, protocolVersion, nodeName, declaredAddress, features }:
      PeerSpecOpts,
  ) {
    this.agentName = agentName;
    this.protocolVersion = protocolVersion;
    this.nodeName = nodeName;
    this.declaredAddress = declaredAddress;
    this.features = features;
  }

  encode(writer: CursorWriter): void {
    writer.putString(this.agentName);
    this.protocolVersion.encode(writer);
    writer.putString(this.nodeName);
    writer.putOption(this.declaredAddress, (w, addr) => {
      throw new Error("encode declaredAddress with value not implemented");
    });
    writer.putUint8(this.features.length);
    this.features.forEach((f) => encodePeerFeature(writer, f));
  }

  static decode(reader: CursorReader): PeerSpec {
    const agentName = reader.getString();
    const protocolVersion = Version.decode(reader);
    const nodeName = reader.getString();
    const declaredAddress = reader.getOption<Multiaddr>((r) => {
      multiaddr;
      throw new Error("declaredAddress with value PeerSpec not implemented");
    });
    const features = decodeMany(reader, decodePeerFeature);

    return new PeerSpec({
      agentName,
      protocolVersion,
      nodeName,
      declaredAddress,
      features,
    });
  }

  static fromConfig({ p2p }: ErgodeConfig): PeerSpec {
    throw new Error("not implemented");
  }
}
