import { Connection, createConnection } from "./connection.ts";
import { faker } from "../test_deps.ts";
import { toMultiaddr } from "../multiaddr/mod.ts";
import { ConnectionManager } from "./connection_manager.ts";
import { log } from "../deps.ts";
import { createRandomPeerStore } from "../peers/testing.ts";
import { createRandomTransport } from "../transports/testing.ts";

export function createRandomConnection(): Connection {
  const localAddr = `127.0.0.1:${faker.internet.port()}`;
  const remoteAddr = `${faker.internet.ipv4()}:${faker.internet.port()}`;
  const readable = new ReadableStream({});
  const writable = new WritableStream({});

  return createConnection({
    connId: faker.datatype.uuid(),
    localAddr: toMultiaddr(localAddr),
    remoteAddr: toMultiaddr(remoteAddr),
    direction: "inbound",
    readable,
    writable,
    close: () => undefined,
  });
}

export function createRandomConnectionManager(): ConnectionManager {
  return new ConnectionManager({
    logger: log.getLogger(),
    maxConnections: 5,
    peerStore: createRandomPeerStore(),
    transport: createRandomTransport(),
  });
}
