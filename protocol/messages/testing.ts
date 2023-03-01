import { createRandomConfig } from "../../config/testing.ts";
import { createRandomPeerStore } from "../../peers/testing.ts";
import { DefaultNetworkMessageCodec } from "../codec.ts";
import { MessageHandlerContext } from "./handler_context.ts";

export async function createRandomHandlerContext(): Promise<
  MessageHandlerContext
> {
  const config = createRandomConfig();
  const peerStore = createRandomPeerStore();
  const codec = new DefaultNetworkMessageCodec(
    new Uint8Array(config.network.magicBytes),
  );
  await codec.beforeStart(); // ensure wasm is initialized

  return { config, peerStore, codec };
}
