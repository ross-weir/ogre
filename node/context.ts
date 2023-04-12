import { OgreConfig } from "../config/mod.ts";
import { PeerSpec } from "../protocol/mod.ts";

export interface NodeContext {
  config: OgreConfig;
  // so we don't need to recreate it for every handshake
  peerSpec: PeerSpec;
}
