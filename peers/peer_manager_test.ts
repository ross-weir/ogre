import { assertSpyCalls, FakeTime, spy } from "../test_deps.ts";
import { createRandomPeerManager } from "./testing.ts";

Deno.test("[peers/peer_manager] gossipPeers is called at configured interval", async () => {
  const time = new FakeTime();
  const pm = createRandomPeerManager(120);
  const gossipSpy = spy(pm, "gossipPeers");

  await pm.start();

  try {
    // should be called every 2 minutes (120 seconds)
    assertSpyCalls(gossipSpy, 0);
    time.tick(60 * 1000); // 1 minute
    assertSpyCalls(gossipSpy, 0);
    time.tick(65 * 1000); // 2 minutes 5 seconds
    assertSpyCalls(gossipSpy, 1);
    time.tick(65 * 1000); // 3 minutes 10 seconds
    assertSpyCalls(gossipSpy, 1);
    time.tick(60 * 1000); // 4 minutes 10 seconds
    assertSpyCalls(gossipSpy, 2);
  } finally {
    time.restore();
  }
});
