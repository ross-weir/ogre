import { Connection } from "./connection.ts";
import { faker } from "../test_deps.ts";
import { toMultiaddr } from "../multiaddr/mod.ts";

export function createRandomConnection(): Connection {
  const localAddr = `127.0.0.1:${faker.internet.port()}`;
  const remoteAddr = `${faker.internet.ipv4()}:${faker.internet.port()}`;
  const readable = new ReadableStream({});
  const writable = new WritableStream({});

  return {
    connId: faker.datatype.uuid(),
    localAddr: toMultiaddr(localAddr),
    remoteAddr: toMultiaddr(remoteAddr),
    direction: "inbound",
    readable,
    writable,
  };
}
