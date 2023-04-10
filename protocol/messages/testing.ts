import { createRandomConfig } from "../../config/testing.ts";
import { createRandomPeerStore } from "../../peers/testing.ts";
import { DefaultNetworkMessageCodec } from "../codec.ts";
import { PeerSpec } from "../peer_spec/mod.ts";
import { MessageHandlerContext } from "./handler_context.ts";
import { HandshakeMessage } from "./mod.ts";

export function createRandomHandlerContext(): MessageHandlerContext {
  const config = createRandomConfig();
  const peerStore = createRandomPeerStore();
  const codec = new DefaultNetworkMessageCodec(
    new Uint8Array(config.network.magicBytes),
  );

  return { config, peerStore, codec };
}

export function createHandshakeWithVersion(ver: string): HandshakeMessage {
  const cfg = createRandomConfig();
  cfg.p2p.refNodeVersion = ver;

  return HandshakeMessage.withSpec(PeerSpec.fromConfig(cfg));
}
