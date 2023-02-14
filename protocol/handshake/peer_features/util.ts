import { ErgodeConfig } from "../../../config/mod.ts";
import { ModePeerFeature } from "./mode_peer_feature.ts";
import { PeerFeature } from "./peer_feature.ts";
import { SessionIdPeerFeature } from "./session_id_peer_feature.ts";

function stateTypeStrToCode(stateType: "utxo" | "digest") {
  if (stateType === "utxo") {
    return 0;
  }

  return 1;
}

export function createFeaturesFromConfig(cfg: ErgodeConfig): PeerFeature[] {
  const { node } = cfg;

  const mode = new ModePeerFeature({
    stateType: stateTypeStrToCode(node.stateType),
    isVerifyingTransactions: node.verifyTransactions,
    blocksToKeep: node.blocksToKeep,
  });

  const sessionId = SessionIdPeerFeature.fromMagicBytes(
    new Uint8Array(cfg.network.magicBytes),
  );

  return [mode, sessionId];
}
