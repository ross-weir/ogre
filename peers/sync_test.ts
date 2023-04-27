import { assertEquals } from "../test_deps.ts";
import { createRandomPeer, createRandomSyncManager } from "./testing.ts";

Deno.test("[peers/sync] SyncManager.monitorPeer doesn't add duplicate peers to state", () => {
  const sm = createRandomSyncManager();
  const peer = createRandomPeer();

  sm.monitorPeer(peer);

  assertEquals(sm.states.length, 1);
  sm.monitorPeer(peer);
  assertEquals(sm.states.length, 1);
});

Deno.test("[peers/sync] SyncManager.discardPeer removes supplied peer from states", () => {
  const sm = createRandomSyncManager();
  const peer = createRandomPeer();
  const peer2 = createRandomPeer();
  const peer3 = createRandomPeer();

  sm.monitorPeer(peer);
  sm.monitorPeer(peer2);
  sm.monitorPeer(peer3);

  assertEquals(sm.states.length, 3);

  sm.discardPeer(peer2);

  assertEquals(sm.states.length, 2);

  const discardedPeer = sm.states.find((p) => p.peer.isEqual(peer2));
  assertEquals(discardedPeer, undefined);
});

Deno.test("[peers/sync] SyncManager.getPeerSyncState returns the state for the supplied peer", () => {
  const sm = createRandomSyncManager();
  const peer = createRandomPeer();
  const peer2 = createRandomPeer();
  const peer3 = createRandomPeer();

  sm.monitorPeer(peer2);
  sm.monitorPeer(peer);
  sm.monitorPeer(peer3);

  assertEquals(sm.getPeerSyncState(peer2)?.peer, peer2);
  assertEquals(sm.getPeerSyncState(peer)?.peer, peer);
  assertEquals(sm.getPeerSyncState(peer3)?.peer, peer3);
});
