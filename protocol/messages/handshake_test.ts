import { ScorexReader } from "../../io/scorex_buffer.ts";
import { Handshake, MAX_HANDSHAKE_SIZE } from "./handshake.ts";
import { assertEquals, assertThrows } from "../../test_deps.ts";

function hexToBytes(hex: string) {
  return new Uint8Array(
    hex.match(/[\da-f]{2}/gi)!.map(function (h) {
      return parseInt(h, 16);
    }),
  );
}

Deno.test("[protocol/messages/handshake] Decoding throws error if handshake too large", async () => {
  const bytes = new Uint8Array(MAX_HANDSHAKE_SIZE + 1);
  const r = await ScorexReader.create(bytes);

  assertThrows(() => Handshake.decode(r));
});

// https://github.com/ergoplatform/ergo/blob/d6e7e78b226ed70edb99bb78491b584e2654dd2d/src/test/scala/org/ergoplatform/network/HandshakeSpecification.scala
Deno.test("[protocol/messages/handshake] Decoding", async () => {
  const hsHex =
    "bcd2919cee2e076572676f726566030306126572676f2d6d61696e6e65742d332e332e36000210040001000102067f000001ae46";
  const hsBytes = hexToBytes(hsHex);
  const r = await ScorexReader.create(hsBytes);
  const hs = Handshake.decode(r);

  assertEquals(hs.unixTimestamp, 1610134874428n); // Friday, 8 January 2021, 19:41:14

  const { peerSpec } = hs;

  assertEquals(peerSpec.agentName, "ergoref");
  assertEquals(peerSpec.nodeName, "ergo-mainnet-3.3.6");
  assertEquals(peerSpec.protocolVersion.major, 3);
  assertEquals(peerSpec.protocolVersion.minor, 3);
  assertEquals(peerSpec.protocolVersion.patch, 6);
  assertEquals(peerSpec.declaredAddress, undefined);
});
