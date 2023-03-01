import { PeerStore } from "./peer_store.ts";
import { log } from "../deps.ts";
import { Peer } from "./peer.ts";
import { createRandomConnection } from "../net/testing.ts";
import { createRandomPeerSpec } from "../protocol/peer_spec/testing.ts";
import { NetworkMessageCodec } from "../protocol/codec.ts";

export function createRandomPeerStore(): PeerStore {
  return new PeerStore({ logger: log.getLogger(), configAddrs: [] });
}

export function createRandomPeer(codec: NetworkMessageCodec): Peer {
  return new Peer({
    conn: createRandomConnection(),
    logger: log.getLogger(),
    localSpec: createRandomPeerSpec(),
    codec,
  });
}
