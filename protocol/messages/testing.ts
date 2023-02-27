import { createRandomConfig } from "../../config/testing.ts";
import { createRandomPeerStore } from "../../peers/testing.ts";
import { MessageHandlerContext } from "./handler_context.ts";

export function createRandomHandlerContext(): MessageHandlerContext {
  const config = createRandomConfig();
  const peerStore = createRandomPeerStore();

  return { config, peerStore };
}
