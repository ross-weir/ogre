import { z } from "../deps.ts";
import { isMultiaddrStr } from "../multiaddr/mod.ts";
import { isDigestWithLen } from "../_utils/hex.ts";
import { isSemVer } from "../_utils/isSemVer.ts";

const logLevels = z.enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]);

/** Logging config schema */
const loggingConfigSchema = z.object({
  console: z.object({
    level: logLevels,
  }),
});

/** Logging config schema type. */
export type LoggingConfig = z.infer<typeof loggingConfigSchema>;

/**
 * Full ergode config schema, can be used to validate
 * user supplied configuration.
 *
 * @example
 * ```ts
 * import {ergodeConfigSchema} from "./schema.ts";
 *
 * const config = {};
 * ergodeConfigSchema.parse(config);
 */
export const ergodeConfigSchema = z.object({
  node: z.object({
    stateType: z.enum(["utxo", "digest"]),
    verifyTransactions: z.boolean(),
    blocksToKeep: z.number(),
    poPowBootstrap: z.boolean(),
    minimalSuffix: z.number(),
  }),
  chain: z.object({
    // Blockchain protocol version supported by the client.
    // Version 1 is mainnet launch version
    // Version 2 is about the hardening fork, Autolykos 2 PoW with no non-outsourceability, tx witnesses commitments
    // Version 3 is about 5.0 contracts interpreter with JIT costing, monotonic creation height rule
    protocolVersion: z.number().min(1).max(3),
    addressPrefix: z.number(),
    genesisStateDigest: z.string().refine(isDigestWithLen(33), {
      message: "must be hex string of digest with length 33",
    }),
  }),
  p2p: z.object({
    nodeName: z.string(),
    // this is used in the reference client to determine certain things and certain feature support
    // this is not the version of ergode
    refNodeVersion: z.string().refine(isSemVer, {
      message: "must be semantic versioning format",
    }),
    agentName: z.string(),
  }),
  network: z.object({
    magicBytes: z.number().array().length(4),
    declaredAddress: z.string().refine(isMultiaddrStr).optional(),
  }),
  peers: z.object({
    handshakeTimeoutMs: z.number(),
    knownAddrs: z.string().refine(isMultiaddrStr).array(),
    maxConnections: z.number(),
    gossipIntervalSec: z.number(),
  }),
  logging: loggingConfigSchema,
});

/** Ergode config schema type. */
export type ErgodeConfig = z.infer<typeof ergodeConfigSchema>;

const partialErgodeConfigSchema = ergodeConfigSchema.deepPartial();

/** Ergode config schema type with all values optional. */
export type PartialErgodeConfig = z.infer<typeof partialErgodeConfigSchema>;

/** NetworkType schema. */
export const networkTypeSchema = z.enum(["mainnet", "testnet", "devnet"]);
export type NetworkType = z.infer<typeof networkTypeSchema>;
