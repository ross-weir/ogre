import { Multiaddr } from "../deps.ts";
import { createRandomConnection } from "../net/testing.ts";
import { Listener } from "./listener.ts";
import { Transport } from "./transport.ts";

export function createRandomTransport(): Transport {
  return {
    dial(_addr: Multiaddr) {
      return Promise.resolve(createRandomConnection());
    },
    createListener() {
      return {} as Listener;
    },
  };
}
