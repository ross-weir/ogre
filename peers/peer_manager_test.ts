import {
  assert,
  assertEquals,
  assertSpyCalls,
  FakeTime,
  returnsNext,
  Spy,
  spy,
  stub,
} from "../test_deps.ts";
import { createRandomPeer, createRandomPeerManager } from "./testing.ts";
import { _internals } from "./peers_query.ts";
import { PeerRemovalReason } from "./peer_manager.ts";
import { createRandomConnection } from "../net/testing.ts";

Deno.test("[peers/peer_manager] gossipPeers is called at configured interval", async () => {
  const time = new FakeTime();
  const pm = createRandomPeerManager({ gossipIntervalSecs: 120 });
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

Deno.test("[peers/peer_manager] evictPeer is called at configured interval", async () => {
  const time = new FakeTime();
  const pm = createRandomPeerManager({ evictIntervalSecs: 3600 });
  const evictSpy = spy(pm, "evictPeer");

  await pm.start();

  try {
    assertSpyCalls(evictSpy, 0);
    time.tick(60 * 1000); // 1 minute
    assertSpyCalls(evictSpy, 0);
    time.tick(65 * 1000); // 2 minutes 5 seconds
    assertSpyCalls(evictSpy, 0);
    time.tick(3600 * 1000); // 1 hour 2 minutes
    assertSpyCalls(evictSpy, 1);
    time.tick(600 * 1000);
    assertSpyCalls(evictSpy, 1);
    time.tick(3600 * 1000);
    assertSpyCalls(evictSpy, 2);
  } finally {
    time.restore();
  }
});

Deno.test("[peers/peer_manager] evictPeer dispatches a peer:removed event", async () => {
  const peer = createRandomPeer();
  const peersStub = stub(_internals, "_peers", returnsNext([[peer]]));
  const pm = createRandomPeerManager();
  let eventRaised = false;

  pm.addEventListener("peer:removed", ({ detail }) => {
    const { reason, peer: eventPeer } = detail;

    assertEquals(reason, PeerRemovalReason.Evicted);
    assert(peer.isEqual(eventPeer));
    eventRaised = true;
  });

  await pm.evictPeer();

  try {
    assert(eventRaised);
  } finally {
    peersStub.restore();
  }
});

Deno.test("[peers/peer_manager] evictPeer calls peer.stop()", async () => {
  const peer = createRandomPeer();
  const peerStopSpy = spy(peer, "stop");
  const pm = createRandomPeerManager();
  const peersStub = stub(_internals, "_peers", returnsNext([[peer]]));

  await pm.evictPeer();

  try {
    assertSpyCalls(peerStopSpy, 1);
  } finally {
    peersStub.restore();
  }
});

Deno.test("[peers/peer_manager] PeerManager.stop() calls Peer.stop() for all peers", async () => {
  let peerStopSpy1: Spy | undefined;
  let peerStopSpy2: Spy | undefined;

  const pm = createRandomPeerManager();
  pm.addEventListener("peer:new", ({ detail: peer }) => {
    if (!peerStopSpy1) {
      peerStopSpy1 = spy(peer, "stop");
      return;
    }

    if (!peerStopSpy2) {
      peerStopSpy2 = spy(peer, "stop");
      return;
    }
  });
  pm.acceptConnection(createRandomConnection());
  pm.acceptConnection(createRandomConnection());

  await pm.stop();

  assertSpyCalls(peerStopSpy1!, 1);
  assertSpyCalls(peerStopSpy2!, 1);
});
