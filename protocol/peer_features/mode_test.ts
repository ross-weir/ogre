import { ScorexReader } from "../../io/scorex_buffer.ts";
import { MAX_MODE_FEATURE_SIZE, ModePeerFeature } from "./mode.ts";
import { assertThrows } from "../../test_deps.ts";

Deno.test("[protocol/peer_features/mode] Decoding throws error if over max mode size", async () => {
  const r = await ScorexReader.create(
    new Uint8Array(MAX_MODE_FEATURE_SIZE + 1),
  );

  assertThrows(() => ModePeerFeature.decode(r));
});
