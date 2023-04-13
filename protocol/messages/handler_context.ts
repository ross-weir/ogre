import { OgreConfig } from "../../config/schema.ts";
import { log } from "../../deps.ts";
import { PeerStore } from "../../peers/mod.ts";
import { NetworkMessageCodec } from "../codec.ts";

/** Context used by `MessageHandler` while handling messages */
export interface MessageHandlerContext {
  peerStore: PeerStore;
  config: OgreConfig;
  codec: NetworkMessageCodec;
  logger: log.Logger;
  // databases
  // etc
}
