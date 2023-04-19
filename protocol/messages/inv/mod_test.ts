import { assertEquals } from "../../../test_deps.ts";
import { InvPayload, ObjectTypeId } from "../../inv.ts";
import { InvMessage } from "./mod.ts";

Deno.test("[protocol/messages/inv] Inv.name", () => {
  const msg = new InvMessage(new InvPayload(ObjectTypeId.BlockHeader, []));

  assertEquals(msg.name, "Inv");
});

Deno.test("[protocol/messages/inv] Inv.code", () => {
  const msg = new InvMessage(new InvPayload(ObjectTypeId.BlockHeader, []));

  assertEquals(msg.code, 55);
});
