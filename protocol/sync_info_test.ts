import { bytesToHex, hexToBytes } from "../_utils/hex.ts";
import { BlockHeader } from "../chain/block_header.ts";
import { ScorexReader, ScorexWriter } from "../io/scorex_buffer.ts";
import { assert, assertEquals, assertThrows } from "../test_deps.ts";
import { SyncInfoV1, SyncInfoV2, SyncInfoVersion } from "./sync_info.ts";

Deno.test("[protocol/sync_info] SyncInfoV1.version returns v1", () => {
  const syncInfo = new SyncInfoV1([]);

  assertEquals(syncInfo.version, SyncInfoVersion.V1);
});

Deno.test("[protocol/sync_info] SyncInfoV1.decode throws if too many items", () => {
  const writer = new ScorexWriter();
  writer.putUint16(SyncInfoV1.MAX_ITEMS + 5);
  const reader = new ScorexReader(writer.buffer);

  assertThrows(
    () => SyncInfoV1.decode(reader),
    RangeError,
    "length exceeds limit",
  );
});

Deno.test("[protocol/sync_info] SyncInfoV2 encoding roundtrip", async (t) => {
  const objHex =
    "00ff04dc0103091f8f1acb6eb40260887eca83946fc256ed1346f83bc2714bf34a0b895749a92268a9b428ebe107687dca6f53790985c385a4dbe439e7202eca24a0e602d8348a156d93f90af073e03ee3dcca164afebe5fe4ba0a570171d2fedeab05815ded00c8b004a3a8239e2aa1bc5a22b49bf68217b4f97e09690c82bb3622e6732fb516fb80f2b0f930be2e1ffcefb453b47b05d7d1ecf66030ffcbe28af85913168e0b5c2d3e3a39990501a0acfdf818000000000260a3eb50199a32b197fe68f0d69d7c2c0a753b2ba29be6dec12f426ad73590c9066a8ce4158d66e2dc0103a70892395ae9d1ba1d49e9196f4c6a5c0d37aba3e73038fde7f4de5006a6971a7b98b555caa63d270ecf71743d96b57b6e6f9791d68f419a14e63e46b76f507e81d1bdb64c80489156dd3e8254b454609af380382eae0a9dadc833865c5784ffc96404682709daaa8ab1ee71214fc53fe761b49d4cee8c68a9d4d1248038c32d16d3b7c5b0f93069c44bb8dea71251927795ae158f4f09363a843c18f9ecfcc4392b1e3264cf650501a0acedf8180000000003f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d410000000025c94c10dc0103eb3609ae6063f42385971bae5d8c7c13da47006a6090b3b18def17f16956cd001240a1e3592b0576bbb2117ade8c9eb2f0dd0906a956710f06a8702eced1efe91610ccb458a75e9d58f34840d997025fb86a3353d5956adfc51cabac3f2ca0d75bf7aac7778c095cca125064b2f8b3a1acb1dbd167e2301ff3d91bc520542a1816b4e5f6adf93027d8a9479404838a3a50203dacbd5f2f0f173e68b4946a599df388287e40b2ba0501aafafdf718000000000260a3eb50199a32b197fe68f0d69d7c2c0a753b2ba29be6dec12f426ad73590c906303079e00a1372dc01037eedd09370b6989e3b74a81553276ba2b2b57fe4629e9c837de95eece41f0a91558b6310265ff0f4078641c0c874f110b400689b1c68a5921cb6c282faf720f402184244d429d8a35335cc16ad2a8e83b6872f97c15e46de8fa1b0788feac356df153c5ce9f95e3a19fc9617c4214c9addd11e74b45e2a22937a0daba196bf1c1690f9a9a5f930bf643c4dfae3b304b2ccb0a90512b369251e9b5a4a4fd620e3bbe16adc1e3eae0501ae72fdf4180000000003f077fbc52183e6ed8455629fc5f1c99b7a9cd93a66293d79bbe0a640aade2d41000000004b6f7cad";
  const objBytes = hexToBytes(objHex);
  const reader = new ScorexReader(objBytes);
  const syncInfo = SyncInfoV2.decode(reader);

  await t.step("check decoded", async (t) => {
    assertEquals(syncInfo.items.length, 4);

    await t.step("check header at index 0 (first header)", () => {
      const header = syncInfo.items[0];

      assertEquals(header.height, 408701);
      assertEquals(header.timestamp, 1681850663035n);
      assertEquals(
        header.parentId,
        "091f8f1acb6eb40260887eca83946fc256ed1346f83bc2714bf34a0b895749a9",
      );
    });

    await t.step("check header at index 2", () => {
      const header = syncInfo.items[2];

      assertEquals(header.height, 408573);
      assertEquals(header.timestamp, 1681844449972n);
      assertEquals(
        header.parentId,
        "eb3609ae6063f42385971bae5d8c7c13da47006a6090b3b18def17f16956cd00",
      );
    });

    await t.step("check header at index 3 (last header)", () => {
      const header = syncInfo.items[3];

      assertEquals(header.height, 408189);
      assertEquals(header.timestamp, 1681826413712n);
      assertEquals(
        header.parentId,
        "7eedd09370b6989e3b74a81553276ba2b2b57fe4629e9c837de95eece41f0a91",
      );
    });
  });

  await t.step("re-encode", () => {
    const writer = new ScorexWriter();
    syncInfo.encode(writer);

    assertEquals(bytesToHex(writer.buffer), objHex);
  });
});

Deno.test("[protocol/sync_info] SyncInfoV2.decode throws if v1 length is non-zero", () => {
  const objBytes = new Uint8Array([4]);
  const reader = new ScorexReader(objBytes);

  assertThrows(
    () => SyncInfoV2.decode(reader),
    RangeError,
    "expected v1 length to be 0",
  );
});

Deno.test("[protocol/sync_info] SyncInfoV2.decode throws if v2 marker is incorrect", () => {
  const objBytes = new Uint8Array([0, 4]);
  const reader = new ScorexReader(objBytes);

  assertThrows(
    () => SyncInfoV2.decode(reader),
    Error,
    "unsupported marker",
  );
});

Deno.test("[protocol/sync_info] SyncInfoV2.decode throws if too many headers in payload", () => {
  const objBytes = new Uint8Array([0, -1, SyncInfoV2.MAX_ITEMS + 5]);
  const reader = new ScorexReader(objBytes);

  assertThrows(
    () => SyncInfoV2.decode(reader),
    RangeError,
    "item length exceeds limit",
  );
});

Deno.test("[protocol/sync_info] SyncInfoV2.decode throws if header is too large", () => {
  const objBytes = new Uint8Array([0, -1, 1]);
  const writer = new ScorexWriter();
  writer.putBytes(objBytes);
  writer.putUint16(SyncInfoV2.MAX_ITEM_SIZE_BYTES + 5); // add the header size
  const reader = new ScorexReader(writer.buffer);

  assertThrows(
    () => SyncInfoV2.decode(reader),
    RangeError,
    "header size exceeds limit",
  );
});

Deno.test("[protocol/sync_info] SyncInfo.isEmpty", async (t) => {
  await t.step("empty items", () => {
    const syncInfo = new SyncInfoV2([]);

    assert(syncInfo.isEmpty);
  });

  await t.step("non-empty items", () => {
    const syncInfo = new SyncInfoV2([{} as BlockHeader]);

    assert(!syncInfo.isEmpty);
  });
});
