import { z } from "../deps.ts";

const logLevels = z.enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]);

const loggingConfigSchema = z.object({
  console: z.object({
    level: logLevels,
  }),
});

export type LoggingConfig = z.infer<typeof loggingConfigSchema>;

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
  }),
  p2p: z.object({
    nodeName: z.string(),
    agentName: z.string(),
  }),
  network: z.object({
    magicBytes: z.number().array().length(4),
  }),
  peers: z.object({
    handshakeTimeoutMs: z.number(),
    knownAddrs: z.string().array(),
    maxConnections: z.number(),
  }),
  logging: loggingConfigSchema,
});
const partialErgodeConfigSchema = ergodeConfigSchema.deepPartial();

export type ErgodeConfig = z.infer<typeof ergodeConfigSchema>;
export type PartialErgodeConfig = z.infer<typeof partialErgodeConfigSchema>;
