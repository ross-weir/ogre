import { assert, assertThrows } from "../test_deps.ts";
import { identifier } from "./identifier.ts";

Deno.test("[chain/identifier] identifierFromBytes throws if buffer wrong length", () => {
  assertThrows(() =>
    identifier.fromBytes(new Uint8Array(identifier.requiredLength - 1))
  );
});

Deno.test("[chain/identifier] identifierFromBytes succeeds for correct length", () => {
  assert(identifier.fromBytes(new Uint8Array(identifier.requiredLength)));
});
