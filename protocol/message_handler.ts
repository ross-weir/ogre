import { Peer, PeerAddressBook } from "../peers/mod.ts";

export interface NetworkMessageHandler {
  handle(msg: Uint8Array, peer: Peer): Promise<void>;
}

export interface MessageHandlerContext {
  peerAddressBook: PeerAddressBook;
  // decoder
  // databases
  // etc
}

export class DefaultMessageHandler implements NetworkMessageHandler {
  constructor() {
  }

  handle(_msg: Uint8Array, _peer: Peer): Promise<void> {
    // create scorex reader
    // parse msg into concrete message/validate
    // call concrete message handler
    return Promise.resolve();
  }
}
