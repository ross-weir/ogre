import { assert } from "../test_deps.ts";
import { isMultiaddrStr } from "./mod.ts";

Deno.test("[multiaddr/isMultiAddrFmt] Returns true for valid multiaddr string", () => {
  assert(isMultiaddrStr("/ip4/127.0.0.1/tcp/1337"));
});

Deno.test("[multiaddr/isMultiAddrFmt] Returns false for invalid multiaddr string", () => {
  assert(!isMultiaddrStr("127.0.0.1:1337"));
});
