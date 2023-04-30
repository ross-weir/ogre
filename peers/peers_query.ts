import { semver } from "../deps.ts";
import { NetworkMessage } from "../protocol/mod.ts";
import { Version } from "../protocol/version.ts";
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
      return this.cmpVersion(">=", msg.protocolVersion);
    },
    /** Filter peers by their declared version based on the operator */
    cmpVersion(op: semver.Operator, ver: Version | string) {
      filteredPeers = filteredPeers.filter((p) => {
        if (!p.handshake) {
          return false;
        }

        const peerVer = p.handshake.peerSpec.refNodeVersion.toString();
        const verStr = ver instanceof Version ? ver.toString() : ver;

        return semver.cmp(peerVer, op, verStr);
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
