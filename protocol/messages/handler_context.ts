import { ErgodeConfig } from "../../config/schema.ts";
import { PeerStore } from "../../peers/mod.ts";
import { NetworkMessageCodec } from "../codec.ts";

/** Context used by `MessageHandler` while handling messages */
export interface MessageHandlerContext {
  peerStore: PeerStore;
  config: ErgodeConfig;
  codec: NetworkMessageCodec;
  // databases
  // etc
}
