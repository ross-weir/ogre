import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { AutolykosSolution } from "../../chain/mining.ts";
import { BlockVersion } from "../../chain/mod.ts";
import { GROUP_ELEMENT_GENERATOR } from "../../crypto/mod.ts";
import { ScorexReader, ScorexWriter } from "../../io/scorex_buffer.ts";
import { assert, assertEquals } from "../../test_deps.ts";
import { BlockHeaderSerializer } from "./block_header.ts";

Deno.test("[protocol/serializers/block_header] V3 BlockHeaderSerializer roundtrip with PoW", async (t) => {
  const headerHex =
    "0341003f1d8299167b4599a999e93664e53f133632ecf9d324ca997458f6844278a0397d518455ee054fba0acf710b90a426381cc3f172d4674b346df46af9e404586cb21eb495ff9f8e53680bfd07473b676155bac22cdb07e5d85be26a5114889adf67014cbd058366b16cbd8de00ef6c75838f1e5c87097421f88dec7c28c2d16e7eeaabbf830c93cf3c1ccacc1259637da0d4f660d3ae8d1c1e3d27ce41103840c9a2fef9e1905017c359ece180000000003f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d4100000000590b138a";
  const headerBytes = hexToBytes(headerHex);
  const reader = new ScorexReader(headerBytes);
  const serializer = new BlockHeaderSerializer();
  const h = serializer.deserialize(reader);

  await t.step("check fields", () => {
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
  });

  await t.step("check solution", () => {
    const solution = h.solution as AutolykosSolution;

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
  });

  await t.step("re-serialize", () => {
    const writer = new ScorexWriter();
    serializer.serialize(writer, h);
    assertEquals(bytesToHex(writer.buffer), headerHex);
  });
});

Deno.test("[protocol/serializers/block_header] V1 BlockHeaderSerializer roundtrip with PoW", async (t) => {
  const headerHex =
    "01a982bd6de9041f9e78e1b24b8b46af4fab7312c492eb558de24a5423ba9bc41598c2c4a35c8618adc8fe1057065ae83a79ea70958ea064d0db9d3c29f24b1251d41e589ea138dfaeffdd1839f702d06683807ddde88cbac7df29ac8a77a97df4835d1020fcedd2635021dac0f8cfa50c7c4c8789f3a8b14e96acbaa2e5f2b2a80890a8e8f4b230fd8eaa16c36c4befacba781b42f92c428004cb604cc9f931937250ae39954243010100005800000002cc9c5581e8fcbf359b3a3f4e5ba4cd4b91084e607fe2c791fe4a59c55998f6c902cc921dc3b9a46c118016ec4a2a196c2be855e74ae6138112b26fd8c95fcab158000000000000000020e3b1ecaa53fd122f8ec2a60834a3a39e59a8efb092e4480f363a3f8f996471b3";
  const headerBytes = hexToBytes(headerHex);
  const reader = new ScorexReader(headerBytes);
  const serializer = new BlockHeaderSerializer();
  const h = serializer.deserialize(reader);

  await t.step("check fields", () => {
    assertEquals(h.version, BlockVersion.Initial);
    assertEquals(
      h.parentId,
      "a982bd6de9041f9e78e1b24b8b46af4fab7312c492eb558de24a5423ba9bc415",
    );
    assertEquals(
      bytesToHex(h.adProofRoot),
      "98c2c4a35c8618adc8fe1057065ae83a79ea70958ea064d0db9d3c29f24b1251",
    );
    assertEquals(
      bytesToHex(h.txRoot),
      "d41e589ea138dfaeffdd1839f702d06683807ddde88cbac7df29ac8a77a97df4",
    );
    assertEquals(
      bytesToHex(h.stateRoot),
      "835d1020fcedd2635021dac0f8cfa50c7c4c8789f3a8b14e96acbaa2e5f2b2a808",
    );
    assertEquals(h.timestamp, 1662934193168n);
    assertEquals(
      bytesToHex(h.extensionRoot),
      "fd8eaa16c36c4befacba781b42f92c428004cb604cc9f931937250ae39954243",
    );
    assertEquals(h.nBits, 16842752);
    assertEquals(h.height, 88);
    assertEquals(new Uint8Array([0, 0, 0]), h.votes);
  });

  await t.step("check solution", () => {
    const solution = h.solution as AutolykosSolution;

    assertEquals(
      solution.pk.x.toString(16),
      "cc9c5581e8fcbf359b3a3f4e5ba4cd4b91084e607fe2c791fe4a59c55998f6c9",
    );
    assertEquals(
      solution.pk.y.toString(16),
      "68334ebad23e823fe849b1b47e59e4f67b1a8357f2d1bd21c47c3cbf5a3d81c0",
    );

    assertEquals(
      solution.w.x.toString(16),
      "cc921dc3b9a46c118016ec4a2a196c2be855e74ae6138112b26fd8c95fcab158",
    );
    assertEquals(
      solution.w.y.toString(16),
      "bb5fe2b7059844d4bb93a6cf5515c83da9fc5a65d39d0a66e99472016beb3a1c",
    );
    assertEquals(
      solution.d,
      102989381963041047770893292216918901590585359367663663604647072302895645094323n,
    );
    assertEquals(solution.n, new Uint8Array(8));
  });

  await t.step("re-serialize", () => {
    const writer = new ScorexWriter();
    serializer.serialize(writer, h);
    assertEquals(bytesToHex(writer.buffer), headerHex);
  });
});
