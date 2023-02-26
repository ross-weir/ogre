import { devnetDefaultConfig } from "./defaults.ts";
import { ErgodeConfig } from "./schema.ts";

export function createRandomConfig(): ErgodeConfig {
  return devnetDefaultConfig as ErgodeConfig;
}
