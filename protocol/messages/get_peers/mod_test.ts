import { ScorexReader, ScorexWriter } from "../../../io/scorex_buffer.ts";
import { createRandomPeer } from "../../../peers/testing.ts";
import {
  assert,
  assertEquals,
  assertSpyCall,
  assertThrows,
  spy,
} from "../../../test_deps.ts";
import { UnexpectedDataError } from "../../errors.ts";
import { createRandomPeerSpec } from "../../peer_spec/testing.ts";
import { PeersMessage } from "../peers/mod.ts";
import { createRandomHandlerContext } from "../testing.ts";
import { getPeersHandler, GetPeersMessage } from "./mod.ts";

Deno.test("[protocol/messages/get_peers] GetPeers.name", () => {
  const msg = new GetPeersMessage();

  assertEquals(msg.name, "GetPeers");
});

Deno.test("[protocol/messages/get_peers] GetPeers.code", () => {
  const msg = new GetPeersMessage();

  assertEquals(msg.code, 1);
});

Deno.test("[protocol/messages/get_peers] Decode throws error if buffer has data", () => {
  const reader = new ScorexReader(new Uint8Array([1]));

  assertThrows(() => GetPeersMessage.decode(reader), UnexpectedDataError);
});

Deno.test("[protocol/messages/get_peers] Decode succeeds for empty data", () => {
  const reader = new ScorexReader(new Uint8Array([]));
  const msg = GetPeersMessage.decode(reader);

  assert(msg);
});

Deno.test("[protocol/messages/get_peers] Encode", () => {
  const msg = new GetPeersMessage();
  const writer = new ScorexWriter();
  msg.encode(writer);

  assertEquals(writer.buffer, new Uint8Array([]));
});

Deno.test("[protocol/messages/get_peers] Handler sends known specs to peer", async () => {
  const ctx = createRandomHandlerContext();
  const peer = createRandomPeer(ctx.codec);
  const specs = [createRandomPeerSpec(), createRandomPeerSpec()];
  specs.forEach((p) => ctx.peerStore.add(p));
  const peerSpy = spy(peer, "send");

  await getPeersHandler(new GetPeersMessage(), peer, ctx);

  const msg = new PeersMessage(specs);

  assertSpyCall(peerSpy, 0, { args: [msg] });
});
