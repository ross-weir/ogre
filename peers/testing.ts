import { PeerStore } from "./peer_store.ts";
import { log } from "../deps.ts";
import { Peer } from "./peer.ts";
import { createRandomConnection } from "../net/testing.ts";
import { createRandomPeerSpec } from "../protocol/peer_spec/testing.ts";
import { NetworkMessageCodec } from "../protocol/codec.ts";
import { PeerSpec } from "../protocol/mod.ts";
import { createRandomHandlerContext } from "../protocol/messages/testing.ts";

export function createRandomPeerStore(): PeerStore {
  return new PeerStore({ logger: log.getLogger(), configAddrs: [] });
}

export interface RandomPeerOpts {
  codec?: NetworkMessageCodec;
  spec?: PeerSpec;
}

export function createRandomPeer(opts?: RandomPeerOpts): Peer {
  const ctx = createRandomHandlerContext();

  return new Peer({
    conn: createRandomConnection(),
    logger: log.getLogger(),
    localSpec: opts?.spec ?? createRandomPeerSpec(),
    codec: opts?.codec ?? ctx.codec,
  });
}
