import { assert, assertThrows } from "../test_deps.ts";
import { newAdDigest, newDigest32 } from "./mod.ts";

Deno.test("[crypto/mod] newDigest32() throws in input buffer incorrect length", () => {
  const buf = new Uint8Array(31);

  assertThrows(() => newDigest32(buf));
});

Deno.test("[crypto/mod] newDigest32() succeeds for correct length", () => {
  const buf = new Uint8Array(32);

  assert(newDigest32(buf));
});

Deno.test("[crypto/mod] newAdDigest() throws in input buffer incorrect length", () => {
  const buf = new Uint8Array(31);

  assertThrows(() => newAdDigest(buf));
});

Deno.test("[crypto/mod] newAdDigest() succeeds for correct length", () => {
  const buf = new Uint8Array(33);

  assert(newAdDigest(buf));
});
