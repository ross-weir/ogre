import { ErgodeConfig } from "../config/mod.ts";
import { PeerSpec } from "../peers/mod.ts";

export interface NodeContext {
  config: ErgodeConfig;
  // so we don't need to recreate it for every handshake
  peerSpec: PeerSpec;
}
