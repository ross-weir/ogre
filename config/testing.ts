import { devnetDefaultConfig } from "./defaults.ts";
import { OgreConfig } from "./schema.ts";
import { faker } from "../test_deps.ts";
import { toMultiaddr } from "../multiaddr/mod.ts";

export function createRandomConfig(): OgreConfig {
  const base = devnetDefaultConfig as OgreConfig;
  const ip = `${faker.internet.ipv4()}:${faker.internet.port()}`;
  base.network.declaredAddress = toMultiaddr(ip).toString();

  return base;
}
