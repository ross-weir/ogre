import { assertEquals } from "../../test_deps.ts";
import { multiaddr } from "../../deps.ts";
import { Version } from "../version.ts";
import { LocalAddressPeerFeature } from "./mod.ts";
import { PeerSpec } from "./peer_spec.ts";

const testSpec = {
  agentName: "ergode-test",
  refNodeVersion: Version.fromString("1.0.0"),
  nodeName: "ergode-name",
};

Deno.test("[protocol/peer_spec] PeerSpec.addr returns declared address if its defined", () => {
  const spec = new PeerSpec({
    ...testSpec,
    declaredAddress: multiaddr("/ip4/127.0.0.1/tcp/1337"),
    features: [],
  });

  assertEquals(spec.addr.toString(), "/ip4/127.0.0.1/tcp/1337");
});

Deno.test("[protocol/peer_spec] PeerSpec.addr returns declared address as preference over local address feature", () => {
  const localAddrFeature = new LocalAddressPeerFeature(
    multiaddr("/ip4/0.0.0.0/tcp/9401"),
  );
  const spec = new PeerSpec({
    ...testSpec,
    declaredAddress: multiaddr("/ip4/127.0.0.1/tcp/1337"),
    features: [localAddrFeature],
  });

  assertEquals(spec.addr.toString(), "/ip4/127.0.0.1/tcp/1337");
});

Deno.test("[protocol/peer_spec] PeerSpec.addr returns local address feature if no declared address", () => {
  const localAddrFeature = new LocalAddressPeerFeature(
    multiaddr("/ip4/0.0.0.0/tcp/9401"),
  );
  const spec = new PeerSpec({
    ...testSpec,
    features: [localAddrFeature],
  });

  assertEquals(spec.addr.toString(), "/ip4/0.0.0.0/tcp/9401");
});
