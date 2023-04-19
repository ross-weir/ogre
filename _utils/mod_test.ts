import { assertEquals } from "../test_deps.ts";
import { brandedUint8ArrayFactory } from "./mod.ts";

Deno.test("[_utils/mod] brandedUint8ArrayFactory.requiredLength should return the supplied length", () => {
  const test = brandedUint8ArrayFactory("testBranded", 31);

  assertEquals(test.requiredLength, 31);
});
