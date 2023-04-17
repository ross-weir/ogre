import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { BlockVersion } from "../../chain/mod.ts";
import { ScorexReader, ScorexWriter } from "../../io/scorex_buffer.ts";
import { assertEquals } from "../../test_deps.ts";
import { BlockHeaderSerializer } from "./block_header.ts";

Deno.test("[protocol/serializers/block_header] V3 BlockHeaderSerializer roundtrip no PoW", () => {
  const headerHex =
    "0341003f1d8299167b4599a999e93664e53f133632ecf9d324ca997458f6844278a0397d518455ee054fba0acf710b90a426381cc3f172d4674b346df46af9e404586cb21eb495ff9f8e53680bfd07473b676155bac22cdb07e5d85be26a5114889adf67014cbd058366b16cbd8de00ef6c75838f1e5c87097421f88dec7c28c2d16e7eeaabbf830c93cf3c1ccacc1259637da0d4f660d3ae8d1c1e3d27ce41103840c9a2fef9e1905017c359ece1800000000";
  const headerBytes = hexToBytes(headerHex);
  const reader = new ScorexReader(headerBytes);
  const serializer = new BlockHeaderSerializer();
  const h = serializer.deserialize(reader);

  // check fields
  assertEquals(h.version, BlockVersion.Interpreter50);
  assertEquals(
    h.parentId,
    "41003f1d8299167b4599a999e93664e53f133632ecf9d324ca997458f6844278",
  );
  assertEquals(
    bytesToHex(h.adProofRoot),
    "a0397d518455ee054fba0acf710b90a426381cc3f172d4674b346df46af9e404",
  );
  assertEquals(
    bytesToHex(h.txRoot),
    "586cb21eb495ff9f8e53680bfd07473b676155bac22cdb07e5d85be26a511488",
  );
  assertEquals(
    bytesToHex(h.stateRoot),
    "9adf67014cbd058366b16cbd8de00ef6c75838f1e5c87097421f88dec7c28c2d16",
  );
  assertEquals(h.timestamp, 1681604130663n);
  assertEquals(
    bytesToHex(h.extensionRoot),
    "c93cf3c1ccacc1259637da0d4f660d3ae8d1c1e3d27ce41103840c9a2fef9e19",
  );
  assertEquals(h.nBits, 83983413);
  assertEquals(h.height, 403230);
  assertEquals(new Uint8Array([0, 0, 0]), h.votes);

  // encoding
  const writer = new ScorexWriter();
  serializer.serialize(writer, h);
  assertEquals(bytesToHex(writer.buffer), headerHex);
});

Deno.test("[protocol/serializers/block_header] V3 BlockHeaderSerializer roundtrip with PoW", () => {
  const headerHex =
    "0341003f1d8299167b4599a999e93664e53f133632ecf9d324ca997458f6844278a0397d518455ee054fba0acf710b90a426381cc3f172d4674b346df46af9e404586cb21eb495ff9f8e53680bfd07473b676155bac22cdb07e5d85be26a5114889adf67014cbd058366b16cbd8de00ef6c75838f1e5c87097421f88dec7c28c2d16e7eeaabbf830c93cf3c1ccacc1259637da0d4f660d3ae8d1c1e3d27ce41103840c9a2fef9e1905017c359ece180000000003f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d4100000000590b138a";
  const headerBytes = hexToBytes(headerHex);
  const reader = new ScorexReader(headerBytes);
  const serializer = new BlockHeaderSerializer();
  const h = serializer.deserialize(reader);

  // check fields
  assertEquals(h.version, BlockVersion.Interpreter50);
  assertEquals(
    h.parentId,
    "41003f1d8299167b4599a999e93664e53f133632ecf9d324ca997458f6844278",
  );
  assertEquals(
    bytesToHex(h.adProofRoot),
    "a0397d518455ee054fba0acf710b90a426381cc3f172d4674b346df46af9e404",
  );
  assertEquals(
    bytesToHex(h.txRoot),
    "586cb21eb495ff9f8e53680bfd07473b676155bac22cdb07e5d85be26a511488",
  );
  assertEquals(
    bytesToHex(h.stateRoot),
    "9adf67014cbd058366b16cbd8de00ef6c75838f1e5c87097421f88dec7c28c2d16",
  );
  assertEquals(h.timestamp, 1681604130663n);
  assertEquals(
    bytesToHex(h.extensionRoot),
    "c93cf3c1ccacc1259637da0d4f660d3ae8d1c1e3d27ce41103840c9a2fef9e19",
  );
  assertEquals(h.nBits, 83983413);
  assertEquals(h.height, 403230);
  assertEquals(new Uint8Array([0, 0, 0]), h.votes);

  // encoding
  const writer = new ScorexWriter();
  serializer.serialize(writer, h);
  assertEquals(bytesToHex(writer.buffer), headerHex);
});
