import { Multiaddr, multiaddr } from "../../../deps.ts";
import { CursorReader, CursorWriter } from "../../../io/cursor_buffer.ts";
import { NetworkEncodable } from "../../encoding.ts";
import { Version } from "../../version.ts";

export interface PeerSpecOpts {
  agentName: string;
  protocolVersion: Version;
  nodeName: string;
  declaredAddress?: Multiaddr;
  features: unknown[];
}

export class PeerSpec implements NetworkEncodable {
  readonly agentName: string;
  readonly protocolVersion: Version;
  readonly nodeName: string;
  readonly declaredAddress?: Multiaddr;
  readonly features: unknown[];

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
    // writer.putBytes
    writer.putString(this.nodeName);
    writer.putOption(this.declaredAddress, (w, addr) => {
      throw new Error("encode declaredAddress with value not implemented");
    });
    // encode many features
  }

  static decode(reader: CursorReader): PeerSpec {
    const agentName = reader.getString();
    const protocolVersion = Version.decode(reader);
    const nodeName = reader.getString();
    const declaredAddress = reader.getOption<Multiaddr>((r) => {
      multiaddr;
      throw new Error("declaredAddress with value PeerSpec not implemented");
    });
    const features: unknown[] = [];

    return new PeerSpec({
      agentName,
      protocolVersion,
      nodeName,
      declaredAddress,
      features,
    });
  }
}
