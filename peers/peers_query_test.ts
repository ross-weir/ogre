import { GetPeersMessage } from "../protocol/messages/mod.ts";
import { createHandshakeWithVersion } from "../protocol/messages/testing.ts";
import { assert, assertEquals } from "../test_deps.ts";
import { peersQuery } from "./peers_query.ts";
import { createRandomPeer } from "./testing.ts";

Deno.test("[peers/peers_query] peersQuery.canHandle returns peers that can handle provided message", () => {
  const validPeer = createRandomPeer();
  const validHs = createHandshakeWithVersion("0.0.1");
  Object.defineProperty(validPeer, "handshake", {
    get() {
      return validHs;
    },
  });

  const noHandshakePeer = createRandomPeer();
  const oldVersionPeer = createRandomPeer();
  const invalidHs = createHandshakeWithVersion("0.0.0");
  Object.defineProperty(oldVersionPeer, "handshake", {
    get() {
      return invalidHs;
    },
  });
  const msg = new GetPeersMessage();
  const returnedPeers = peersQuery([noHandshakePeer, validPeer, oldVersionPeer])
    .canHandle(msg)
    .peers();

  assertEquals(returnedPeers.length, 1);
  assert(returnedPeers[0].isEqual(validPeer));
});
