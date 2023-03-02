import { assertEquals } from "../test_deps.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Version } from "./version.ts";

Deno.test("[protocol/version] Version encoding roundtrip", () => {
  const w = new ScorexWriter();
  new Version(1, 2, 5).encode(w);
  const r = new ScorexReader(w.buffer);
  const decoded = Version.decode(r);

  assertEquals(decoded.major, 1);
  assertEquals(decoded.minor, 2);
  assertEquals(decoded.patch, 5);
});

Deno.test("[protocol/version] Creates version from string", () => {
  const verStr = "5.0.4";
  const ver = Version.fromString(verStr);

  assertEquals(ver.major, 5);
  assertEquals(ver.minor, 0);
  assertEquals(ver.patch, 4);
});

Deno.test("[protocol/version] ToString conversion", () => {
  const ver = new Version(4, 3, 9);

  assertEquals(ver.toString(), "4.3.9");
});
