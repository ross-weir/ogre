import { ScorexReader, ScorexWriter } from "../../../io/scorex_buffer.ts";
import { assertEquals } from "../../../test_deps.ts";
import { RestApiPeerFeature } from "./rest_api_peer_feature.ts";

Deno.test("[protocol/peer_features/restapi] Returns correct peer feature id", () => {
  const feature = new RestApiPeerFeature(new URL("http://example.com"));

  assertEquals(feature.id, 4);
});

Deno.test("[protocol/peer_features/restapi] Encoding", () => {
  const feature = new RestApiPeerFeature(new URL("http://example.com/"));
  const writer = new ScorexWriter();
  feature.encode(writer);
  const reader = new ScorexReader(writer.buffer);

  assertEquals(reader.getUint8(), 18);

  const urlBytes = reader.getBytes(18);

  assertEquals(new TextDecoder().decode(urlBytes), "http://example.com"); // no trailing slash
});
