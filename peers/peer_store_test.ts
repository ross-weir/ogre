import { assertEquals } from "../test_deps.ts";
import { log, multiaddr } from "../deps.ts";
import { PeerSpec } from "../protocol/mod.ts";
import { Version } from "../protocol/version.ts";
import { PeerStore } from "./peer_store.ts";

Deno.test("[peers/peer_store] PeerStore.add is no-op if spec already exists", () => {
  const spec = new PeerSpec({
    agentName: "ogre",
    refNodeVersion: Version.fromString("1.0.0"),
    nodeName: "test",
    declaredAddress: multiaddr("/ip4/127.0.0.1/tcp/1337"),
    features: [],
  });
  const store = new PeerStore({ configAddrs: [], logger: log.getLogger() });
  store.add(spec);

  assertEquals(store.peerSpecs.length, 1);
  assertEquals(store.peerSpecs[0], spec);

  const spec2 = new PeerSpec({
    agentName: "ogre-updated!!!",
    refNodeVersion: Version.fromString("1.0.0"),
    nodeName: "test",
    declaredAddress: multiaddr("/ip4/127.0.0.1/tcp/1337"),
    features: [],
  });
  store.add(spec2);

  assertEquals(store.peerSpecs.length, 1);
  assertEquals(store.peerSpecs[0].agentName, "ogre");
});

Deno.test("[peers/peer_store] PeerStore.addrs returns unique set of addresses", () => {
  const spec = new PeerSpec({
    agentName: "ogre",
    refNodeVersion: Version.fromString("1.0.0"),
    nodeName: "test",
    declaredAddress: multiaddr("/ip4/127.0.0.1/tcp/1337"),
    features: [],
  });
  const store = new PeerStore({
    // same as a spec in the peer store
    configAddrs: ["/ip4/127.0.0.1/tcp/1337", "/ip4/127.0.0.1/tcp/9099"],
    logger: log.getLogger(),
  });
  store.add(spec);

  assertEquals(store.addrs.length, 2);
  assertEquals(store.addrs.map((a) => a.toString()), [
    "/ip4/127.0.0.1/tcp/1337",
    "/ip4/127.0.0.1/tcp/9099",
  ]);
});
