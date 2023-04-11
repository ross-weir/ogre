import { semver } from "../deps.ts";
import { NetworkMessage } from "../protocol/mod.ts";
import { Peer } from "./peer.ts";

export function _peers(peers: Peer[]) {
  return peers;
}

function _randomize(peers: Peer[]) {
  for (let i = peers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [peers[i], peers[j]] = [
      peers[j],
      peers[i],
    ];
  }
}

/** This pattern is used so we can mock the return value in tests. */
export const _internals = { _peers, _randomize };

export function peersQuery(peers: Peer[]) {
  let filteredPeers = [...peers];

  return {
    /** Filter peers that cannot handle the provided `NetworkMessage`. */
    canHandle(msg: NetworkMessage) {
      const requiredVer = msg.protocolVersion.toString();

      filteredPeers = filteredPeers.filter((p) => {
        if (!p.handshake) {
          return false;
        }

        const peerVer = p.handshake.peerSpec.refNodeVersion.toString();

        return semver.gte(peerVer, requiredVer);
      });

      return this;
    },
    /** Randomize the peers list. */
    randomize() {
      _internals._randomize(filteredPeers);

      return this;
    },
    /** Finalize the query and return the peers. */
    peers(): Peer[] {
      return _internals._peers(filteredPeers);
    },
  };
}
