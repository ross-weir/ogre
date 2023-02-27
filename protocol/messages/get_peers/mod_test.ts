import { ScorexReader, ScorexWriter } from "../../../io/scorex_buffer.ts";
import { assert, assertEquals, assertThrows } from "../../../test_deps.ts";
import { UnexpectedDataError } from "../../errors.ts";
import { GetPeersMessage } from "./mod.ts";

Deno.test("[protocol/messages/get_peers] GetPeers.name", () => {
  const msg = new GetPeersMessage();

  assertEquals(msg.name, "GetPeers");
});

Deno.test("[protocol/messages/get_peers] GetPeers.code", () => {
  const msg = new GetPeersMessage();

  assertEquals(msg.code, 1);
});

Deno.test("[protocol/messages/get_peers] Decode throws error if buffer has data", async () => {
  const reader = await ScorexReader.create(new Uint8Array([1]));

  assertThrows(() => GetPeersMessage.decode(reader), UnexpectedDataError);
});

Deno.test("[protocol/messages/get_peers] Decode succeeds for empty data", async () => {
  const reader = await ScorexReader.create(new Uint8Array([]));
  const msg = GetPeersMessage.decode(reader);

  assert(msg);
});

Deno.test("[protocol/messages/get_peers] Encode", async () => {
  const msg = new GetPeersMessage();
  const writer = await ScorexWriter.create();
  msg.encode(writer);

  assertEquals(writer.buffer, new Uint8Array([]));
});
