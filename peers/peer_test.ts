import { createRandomConnection } from "../net/testing.ts";
import { assertEquals } from "../test_deps.ts";
import { createRandomPeer } from "./testing.ts";

Deno.test("[peers/peer] connId returns the id of the underlying connection", () => {
  const conn = createRandomConnection();
  const peer = createRandomPeer({ conn });

  assertEquals(peer.connId, conn.connId);
});
