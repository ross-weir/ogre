import { ErgodeConfig } from "../../config/schema.ts";
import { createRandomConfig } from "../../config/testing.ts";
import { PeerSpec } from "./peer_spec.ts";

export function createRandomPeerSpec(cfg?: ErgodeConfig): PeerSpec {
  return PeerSpec.fromConfig(cfg ?? createRandomConfig());
}
