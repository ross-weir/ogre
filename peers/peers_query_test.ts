import { GetPeersMessage } from "../protocol/messages/mod.ts";
import { createHandshakeWithVersion } from "../protocol/messages/testing.ts";
import { assert, assertEquals } from "../test_deps.ts";
import { Peer } from "./peer.ts";
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

Deno.test("[peers/peers_query] peersQuery.randomize returns randomly ordered peers", () => {
  const peers: Peer[] = [];
  const validHs = createHandshakeWithVersion("0.0.1");

  for (let i = 0; i < 10; i += 1) {
    const peer = createRandomPeer();
    Object.defineProperty(peer, "handshake", {
      get() {
        return validHs;
      },
    });

    peers.push(peer);
  }

  const msg = new GetPeersMessage();
  const returnedPeers = peersQuery(peers)
    .canHandle(msg)
    .randomize()
    .peers();

  assertEquals(returnedPeers.length, peers.length);

  let isEqual = true;

  for (let i = 0; i < returnedPeers.length; i += 1) {
    if (!returnedPeers[i].isEqual(peers[i])) {
      isEqual = false;

      break;
    }
  }

  assert(!isEqual);
});
