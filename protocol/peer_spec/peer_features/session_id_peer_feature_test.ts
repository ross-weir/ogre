import { ScorexReader, ScorexWriter } from "../../../io/scorex_buffer.ts";
import { assertEquals } from "../../../test_deps.ts";
import { SessionIdPeerFeature } from "./session_id_peer_feature.ts";

Deno.test("[protocol/peer_features/sessionid] Returns correct peer feature id", () => {
  const feature = SessionIdPeerFeature.fromMagicBytes(new Uint8Array([]));

  assertEquals(feature.id, 3);
});

Deno.test("[protocol/peer_features/sessionid] Encoding", async () => {
  const magicBytes = new Uint8Array([2, 0, 2, 3]);
  const sessionId = BigInt(1333333333337);
  const feature = new SessionIdPeerFeature({ magicBytes, sessionId });
  const writer = await ScorexWriter.create();
  feature.encode(writer);
  const reader = await ScorexReader.create(writer.buffer);

  assertEquals(reader.getBytes(4), new Uint8Array([2, 0, 2, 3]));
  assertEquals(reader.getInt64(), 1333333333337n);
});
