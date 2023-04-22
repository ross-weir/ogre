import { toMultiaddr } from "../multiaddr/mod.ts";
import { assertEquals, assertSpyCalls, faker, spy } from "../test_deps.ts";
import { createRandomConnectionManager } from "./testing.ts";

Deno.test("[net/connection_manager] Connections are removed when Connection.close is called", async () => {
  const addr = toMultiaddr(`${faker.internet.ipv4()}:${faker.internet.port()}`);
  const cm = createRandomConnectionManager();
  const closeSpy = spy(cm, "onConnectionClose");

  const conn = await cm.openConnection(addr);

  assertEquals(cm.connectionCount, 1);

  conn.close();

  assertSpyCalls(closeSpy, 1);
  assertEquals(cm.connectionCount, 0);
});
