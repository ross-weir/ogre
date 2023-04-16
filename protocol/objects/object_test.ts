import { assert, assertThrows } from "../../test_deps.ts";
import { OBJECT_ID_LENGTH, objectIdFromBytes } from "./object.ts";

Deno.test("[protocol/objects/object] objectIdFromBytes throws if buffer wrong length", () => {
  assertThrows(() => objectIdFromBytes(new Uint8Array(OBJECT_ID_LENGTH - 1)));
});

Deno.test("[protocol/objects/object] objectIdFromBytes succeeds for correct length", () => {
  assert(objectIdFromBytes(new Uint8Array(OBJECT_ID_LENGTH)));
});
