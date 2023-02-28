import { assertEquals, assertThrows } from "../test_deps.ts";
import {
  defaultsForNetwork,
  devnetDefaultConfig,
  mainnetDefaultConfig,
  testnetDefaultConfig,
} from "./defaults.ts";

Deno.test("[config/defaults] defaultsForNetwork returns correct defaults for devnet", () => {
  assertEquals(defaultsForNetwork("devnet"), devnetDefaultConfig);
});

Deno.test("[config/defaults] defaultsForNetwork returns correct defaults for testnet", () => {
  assertEquals(defaultsForNetwork("testnet"), testnetDefaultConfig);
});

Deno.test("[config/defaults] defaultsForNetwork returns correct defaults for mainnet", () => {
  assertEquals(defaultsForNetwork("mainnet"), mainnetDefaultConfig);
});

Deno.test("[config/defaults] defaultsForNetwork throws error for incorrect network", () => {
  // deno-lint-ignore no-explicit-any
  assertThrows(() => defaultsForNetwork("badnet" as any));
});
