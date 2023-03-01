import { createRandomConfig } from "../../config/testing.ts";
import { createRandomPeerStore } from "../../peers/testing.ts";
import { DefaultNetworkMessageCodec } from "../codec.ts";
import { MessageHandlerContext } from "./handler_context.ts";

export function createRandomHandlerContext(): MessageHandlerContext {
  const config = createRandomConfig();
  const peerStore = createRandomPeerStore();
  const codec = new DefaultNetworkMessageCodec(
    new Uint8Array(config.network.magicBytes),
  );

  return { config, peerStore, codec };
}
