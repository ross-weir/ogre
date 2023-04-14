import { OgreConfig } from "../../../config/schema.ts";
import { assert, assertEquals } from "../../../test_deps.ts";
import { ModePeerFeature } from "./mode_peer_feature.ts";
import { SessionIdPeerFeature } from "./session_id_peer_feature.ts";
import { createFeaturesFromConfig, stateTypeStrToCode } from "./util.ts";

Deno.test("[protocol/peer_spec/peer_features/util] stateTypeStrToCode 'utxo'", () => {
  assertEquals(stateTypeStrToCode("utxo"), 0);
});

Deno.test("[protocol/peer_spec/peer_features/util] stateTypeStrToCode 'digest'", () => {
  assertEquals(stateTypeStrToCode("digest"), 1);
});

Deno.test("[protocol/peer_spec/peer_features/util] createFeaturesFromConfig", () => {
  const config = {
    node: { stateType: "utxo", verifyTransactions: true, blocksToKeep: -1 },
    network: { magicBytes: [2, 0, 2, 3] },
  };
  const features = createFeaturesFromConfig(config as OgreConfig);
  const modePeerFeature = features.find((f) => f instanceof ModePeerFeature);

  assert(modePeerFeature);

  const modeFeature = modePeerFeature as ModePeerFeature;
  assertEquals(modeFeature.stateType, 0);
  assertEquals(modeFeature.isVerifyingTransactions, true);
  assertEquals(modeFeature.blocksToKeep, -1);

  const sessionIdPeerFeature = features.find((f) =>
    f instanceof SessionIdPeerFeature
  );

  assert(sessionIdPeerFeature);

  const sessionIdFeature = sessionIdPeerFeature as SessionIdPeerFeature;
  assertEquals(sessionIdFeature.magicBytes, new Uint8Array([2, 0, 2, 3]));
});

Deno.test("[protocol/peer_spec/peer_features/util] minimalSuffix is undefined if poPowBootstrap is false", () => {
  const config = {
    node: {
      stateType: "utxo",
      verifyTransactions: true,
      blocksToKeep: -1,
      poPowBootstrap: false,
      minimalSuffix: 10,
    },
    network: { magicBytes: [2, 0, 2, 3] },
  };
  const features = createFeaturesFromConfig(config as OgreConfig);
  const modePeerFeature = features.find((f) => f instanceof ModePeerFeature);

  assert(modePeerFeature);

  const modeFeature = modePeerFeature as ModePeerFeature;

  assertEquals(modeFeature.poPowSuffix, undefined);
});

Deno.test("[protocol/peer_spec/peer_features/util] minimalSuffix is set if poPowBootstrap is true", () => {
  const config = {
    node: {
      stateType: "utxo",
      verifyTransactions: true,
      blocksToKeep: -1,
      poPowBootstrap: true,
      minimalSuffix: 10,
    },
    network: { magicBytes: [2, 0, 2, 3] },
  };
  const features = createFeaturesFromConfig(config as OgreConfig);
  const modePeerFeature = features.find((f) => f instanceof ModePeerFeature);

  assert(modePeerFeature);

  const modeFeature = modePeerFeature as ModePeerFeature;

  assertEquals(modeFeature.poPowSuffix, 10);
});
