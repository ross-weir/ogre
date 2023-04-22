import { toMultiaddr } from "../multiaddr/mod.ts";
import { assertSpyCalls, faker, spy } from "../test_deps.ts";
import { createConnection } from "./connection.ts";

Deno.test("[net/connection] Connections wrapped by createConnection emit `connection:close` events", () => {
  const localAddr = `127.0.0.1:${faker.internet.port()}`;
  const remoteAddr = `${faker.internet.ipv4()}:${faker.internet.port()}`;

  const conn = createConnection({
    connId: "1",
    localAddr: toMultiaddr(localAddr),
    remoteAddr: toMultiaddr(remoteAddr),
    direction: "inbound",
    readable: new ReadableStream({}),
    writable: new WritableStream({}),
    close: () => undefined,
  });
  const onClose = () => undefined;
  const onCloseSpy = spy(onClose);

  conn.addEventListener("connection:close", onCloseSpy);
  conn.close();

  assertSpyCalls(onCloseSpy, 1);
});
