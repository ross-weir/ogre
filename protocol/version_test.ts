import { assertEquals } from "../test_deps.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { Version } from "./version.ts";

Deno.test("[protocol/version] Version encoding roundtrip", async () => {
  const w = await ScorexWriter.create();
  new Version(1, 2, 5).encode(w);
  const r = await ScorexReader.create(w.buffer);
  const decoded = Version.decode(r);

  assertEquals(decoded.major, 1);
  assertEquals(decoded.minor, 2);
  assertEquals(decoded.patch, 5);
});
