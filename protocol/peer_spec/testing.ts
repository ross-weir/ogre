import { OgreConfig } from "../../config/schema.ts";
import { createRandomConfig } from "../../config/testing.ts";
import { PeerSpec } from "./peer_spec.ts";

export function createRandomPeerSpec(cfg?: OgreConfig): PeerSpec {
  return PeerSpec.fromConfig(cfg ?? createRandomConfig());
}
