import { assert, assertThrows } from "../test_deps.ts";
import { adDigest, digest32 } from "./mod.ts";

Deno.test("[crypto/mod] digest32.fromBytes() throws in input buffer incorrect length", () => {
  const buf = new Uint8Array(31);

  assertThrows(() => digest32.fromBytes(buf));
});

Deno.test("[crypto/mod] digest32.fromBytes() succeeds for correct length", () => {
  const buf = new Uint8Array(32);

  assert(digest32.fromBytes(buf));
});

Deno.test("[crypto/mod] adDigest.fromBytes() throws in input buffer incorrect length", () => {
  const buf = new Uint8Array(31);

  assertThrows(() => adDigest.fromBytes(buf));
});

Deno.test("[crypto/mod] adDigest.fromBytes() succeeds for correct length", () => {
  const buf = new Uint8Array(33);

  assert(adDigest.fromBytes(buf));
});
