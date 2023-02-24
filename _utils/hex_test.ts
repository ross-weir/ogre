import { isDigestWithLen } from "./hex.ts";
import { assert } from "../test_deps.ts";

Deno.test("[_utils/hex] isDigestWithLength should return true for valid hex string", () => {
  assert(
    isDigestWithLen(33)(
      "cb63aa99a3060f341781d8662b58bf18b9ad258db4fe88d09f8f71cb668cad4502",
    ),
  );
});

Deno.test("[_utils/hex] isDigestWithLength should return false for hex string with bad chars", () => {
  assert(
    !isDigestWithLen(33)(
      "cb63aa99a3060f341781d8662b58bf18b9ad258db4fe88d09f8f71cb668cad45z2",
    ),
  );
});
