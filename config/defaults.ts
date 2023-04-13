import { lodashMerge, structuredClone } from "../deps.ts";
import { NetworkType, PartialOgreConfig } from "./schema.ts";

/** Base defaults used for all network configs. */
const defaultBaseConfig: PartialOgreConfig = {
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
    nodeName: "ogre",
    refNodeVersion: "5.0.6",
    agentName: "ogre",
  },
  peers: {
    knownAddrs: [],
    handshakeTimeoutMs: 30000,
    maxConnections: 30,
    gossipIntervalSec: 120,
    evictIntervalSec: 3600, // once an hour
  },
  logging: {
    console: {
      level: "INFO",
    },
  },
};

/** Default config for devnet network */
export const devnetDefaultConfig: PartialOgreConfig = lodashMerge(
  structuredClone(defaultBaseConfig),
  {
    chain: {
      addressPrefix: 32,
      genesisStateDigest:
        "cb63aa99a3060f341781d8662b58bf18b9ad258db4fe88d09f8f71cb668cad4502",
    },
    network: {
      magicBytes: [2, 0, 4, 8],
    },
  },
);

/** Default config for testnet network */
export const testnetDefaultConfig: PartialOgreConfig = lodashMerge(
  structuredClone(defaultBaseConfig),
  {
    chain: {
      addressPrefix: 16,
      genesisStateDigest:
        "cb63aa99a3060f341781d8662b58bf18b9ad258db4fe88d09f8f71cb668cad4502",
    },
    network: {
      magicBytes: [2, 0, 2, 3],
    },
    peers: {
      knownAddrs: [
        "/ip4/213.239.193.208/tcp/9022",
        "/ip4/168.138.185.215/tcp/9022",
        "/ip4/192.234.196.165/tcp/9022",
      ],
    },
  },
);

/** Default config for mainnet network */
export const mainnetDefaultConfig: PartialOgreConfig = lodashMerge(
  structuredClone(defaultBaseConfig),
  {
    chain: {
      addressPrefix: 0,
      genesisStateDigest:
        "a5df145d41ab15a01e0cd3ffbab046f0d029e5412293072ad0f5827428589b9302",
    },
    network: {
      magicBytes: [1, 0, 2, 4],
    },
  },
);

/**
 * Get the default config values for a network.
 * @param networkType Network type to get the default config for.
 * @returns Default config for the required network.
 */
export function defaultsForNetwork(networkType: NetworkType) {
  switch (networkType) {
    case "mainnet":
      return mainnetDefaultConfig;
    case "testnet":
      return testnetDefaultConfig;
    case "devnet":
      return devnetDefaultConfig;
    default:
      throw new Error(`Invalid network type ${networkType}`);
  }
}
