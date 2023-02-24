import { ErgodeConfig } from "../../config/schema.ts";
import { PeerStore } from "../../peers/mod.ts";

/** Context used by `MessageHandler` while handling messages */
export interface MessageHandlerContext {
  peerStore: PeerStore;
  config: ErgodeConfig;
  // databases
  // etc
}
