import { lodashMerge } from "../deps.ts";
import { defaultsForNetwork } from "./defaults.ts";
import {
  NetworkType,
  OgreConfig,
  ogreConfigSchema,
  PartialOgreConfig,
} from "./schema.ts";

export * from "./schema.ts";

/**
 * Merges the user supplied config with the defaults for `network`.
 *
 * Raises an exception if config is invalid.
 *
 * @example
 * ```ts
 * import {mergeUserConfigAndValidate} from "./mod.ts";
 *
 * const userConfig = {};
 * const fullConfig = mergeUserConfigAndValidate("testnet", userConfig);
 * ```
 *
 * @param network the network the node is running on
 * @param userConfig the user supplied config
 * @returns the merged config
 */
export function mergeUserConfigAndValidate(
  network: NetworkType,
  userConfig: PartialOgreConfig,
): OgreConfig {
  const finalConfig = lodashMerge(defaultsForNetwork(network), userConfig);
  ogreConfigSchema.parse(finalConfig);

  return finalConfig as OgreConfig;
}
