import { ErgodeConfig } from "../../config/schema.ts";
import { PeerAddressBook } from "../../peers/peer_address_book.ts";

/** Context used by `MessageHandler` while handling messages */
export interface MessageHandlerContext {
  peerAddressBook: PeerAddressBook;
  config: ErgodeConfig;
  // databases
  // etc
}
