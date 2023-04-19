import { assertEquals } from "../../../test_deps.ts";
import { InvPayload, ObjectTypeId } from "../../inv.ts";
import { RequestModifiersMessage } from "./mod.ts";

Deno.test("[protocol/messages/request_modifiers] RequestModifiersMessage.name", () => {
  const msg = new RequestModifiersMessage(
    new InvPayload(ObjectTypeId.BlockHeader, []),
  );

  assertEquals(msg.name, "RequestModifiers");
});

Deno.test("[protocol/messages/request_modifiers] RequestModifiersMessage.code", () => {
  const msg = new RequestModifiersMessage(
    new InvPayload(ObjectTypeId.BlockHeader, []),
  );

  assertEquals(msg.code, 22);
});
