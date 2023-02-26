import { createRandomConfig } from "../../config/testing.ts";
import { PeerSpec } from "./peer_spec.ts";

export function createRandomPeerSpec(): PeerSpec {
  return PeerSpec.fromConfig(createRandomConfig());
}
