import { lodashMerge } from "../deps.ts";
import { NetworkType, PartialErgodeConfig } from "./schema.ts";

const defaultBaseConfig: PartialErgodeConfig = {
  node: {
    stateType: "utxo",
    verifyTransactions: false,
    blocksToKeep: -1,
    poPowBootstrap: false,
    minimalSuffix: 10,
  },
  chain: {
    protocolVersion: 3,
  },
  p2p: {
    nodeName: "ergode",
    agentName: "ergode",
  },
  peers: {
    knownAddrs: [],
    handshakeTimeoutMs: 30000,
    maxConnections: 30,
  },
  logging: {
    console: {
      level: "INFO",
    },
  },
};

export const testnetDefaultConfig: PartialErgodeConfig = lodashMerge(
  defaultBaseConfig,
  {
    chain: {
      addressPrefix: 16,
    },
    network: {
      magicBytes: [2, 0, 0, 1],
    },
  },
);

export const mainnetDefaultConfig: PartialErgodeConfig = lodashMerge(
  defaultBaseConfig,
  {
    chain: {
      addressPrefix: 0,
    },
    network: {
      magicBytes: [1, 0, 2, 4],
    },
  },
);

export function defaultsForNetwork(networkType: NetworkType) {
  switch (networkType) {
    case "mainnet":
      return mainnetDefaultConfig;
    case "testnet":
      return testnetDefaultConfig;
    default:
      throw new Error(`Invalid network type ${networkType}`);
  }
}
