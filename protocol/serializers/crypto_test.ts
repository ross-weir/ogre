import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { ScorexReader, ScorexWriter } from "../../io/scorex_buffer.ts";
import { assertEquals } from "../../test_deps.ts";
import { GroupElementSerializer } from "./crypto.ts";

Deno.test("[protocol/serializers/crypto] GroupElementSerializer roundtrip", () => {
  const geHex =
    "03f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d41";
  const geBytes = hexToBytes(geHex);
  const reader = new ScorexReader(geBytes);
  const serializer = new GroupElementSerializer();

  const point = serializer.deserialize(reader);

  assertEquals(
    point.x.toString(16),
    "f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d41",
  );
  assertEquals(
    point.y.toString(16),
    "308e01ed93885d77016fb17e55af15d3b51877778108c4d5835dc09607fc04b1",
  );

  const writer = new ScorexWriter();
  serializer.serialize(writer, point);
  assertEquals(bytesToHex(writer.buffer), geHex);
});
