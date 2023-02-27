import { devnetDefaultConfig } from "./defaults.ts";
import { ErgodeConfig } from "./schema.ts";
import { faker } from "../test_deps.ts";
import { toMultiaddr } from "../multiaddr/mod.ts";

export function createRandomConfig(): ErgodeConfig {
  const base = devnetDefaultConfig as ErgodeConfig;
  const ip = `${faker.internet.ipv4()}:${faker.internet.port()}`;
  base.network.declaredAddress = toMultiaddr(ip).toString();

  return base;
}
