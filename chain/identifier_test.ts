import { assert, assertThrows } from "../test_deps.ts";
import { IDENTIFIER_LENGTH, identifierFromBytes } from "./identifier.ts";

Deno.test("[chain/identifier] identifierFromBytes throws if buffer wrong length", () => {
  assertThrows(() =>
    identifierFromBytes(new Uint8Array(IDENTIFIER_LENGTH - 1))
  );
});

Deno.test("[chain/identifier] identifierFromBytes succeeds for correct length", () => {
  assert(identifierFromBytes(new Uint8Array(IDENTIFIER_LENGTH)));
});
