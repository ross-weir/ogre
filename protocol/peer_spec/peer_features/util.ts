import { OgreConfig } from "../../../config/mod.ts";
import { ModePeerFeature } from "./mode_peer_feature.ts";
import { PeerFeature } from "./peer_feature.ts";
import { SessionIdPeerFeature } from "./session_id_peer_feature.ts";

export function stateTypeStrToCode(stateType: "utxo" | "digest") {
  if (stateType === "utxo") {
    return 0;
  }

  return 1;
}

export function createFeaturesFromConfig(cfg: OgreConfig): PeerFeature[] {
  const { node } = cfg;

  const poPowSuffix = node.poPowBootstrap ? node.minimalSuffix : undefined;
  const mode = new ModePeerFeature({
    stateType: stateTypeStrToCode(node.stateType),
    isVerifyingTransactions: node.verifyTransactions,
    blocksToKeep: node.blocksToKeep,
    poPowSuffix,
  });

  const sessionId = SessionIdPeerFeature.fromMagicBytes(
    new Uint8Array(cfg.network.magicBytes),
  );

  return [mode, sessionId];
}
