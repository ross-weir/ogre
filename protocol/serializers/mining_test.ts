import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { GROUP_ELEMENT_GENERATOR } from "../../crypto/mod.ts";
import { ScorexReader, ScorexWriter } from "../../io/scorex_buffer.ts";
import { assert, assertEquals } from "../../test_deps.ts";
import { AutolykosV2SolutionSerializer } from "./mining.ts";

Deno.test("[protocol/serializers/crypto] AutolykosV2SolutionSerializer roundtrip", () => {
  const solutionHex =
    "03f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d4100000000590b138a";
  const solutionBytes = hexToBytes(solutionHex);
  const reader = new ScorexReader(solutionBytes);
  const serializer = new AutolykosV2SolutionSerializer();
  const solution = serializer.deserialize(reader);

  assertEquals(
    solution.pk.x.toString(16),
    "f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d41",
  );
  assertEquals(
    solution.pk.y.toString(16),
    "308e01ed93885d77016fb17e55af15d3b51877778108c4d5835dc09607fc04b1",
  );
  assert(solution.w.equals(GROUP_ELEMENT_GENERATOR));
  assertEquals(solution.d, 0n);
  assertEquals(bytesToHex(solution.n), "00000000590b138a");

  const writer = new ScorexWriter();
  serializer.serialize(writer, solution);
  assertEquals(bytesToHex(writer.buffer), solutionHex);
});
