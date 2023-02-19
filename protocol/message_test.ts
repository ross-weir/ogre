import { assertEquals } from "../test_deps.ts";
import { ScorexReader } from "../io/scorex_buffer.ts";
import { bytesToHex, hexToBytes } from "../_utils/hex.ts";
import { RawNetworkMessage } from "./message.ts";

/** Real message recorded during reference client execution */
Deno.test("[protocol/message] RawNetworkMessage decodes", async () => {
  const hexData =
    "02000203020000044AC1CAB0670E076572676F726566050007206572676F2D6E6F64652D746573746E65742D6575732E7A6F6F6D6F75742E696F010833512130BE4603100400010001030D02000203FC88C4CFF5FFEDD92F04292868747470733A2F2F6572676F2D6E6F64652D746573746E65742D6575732E7A6F6F6D6F75742E696F076572676F726566050007146D726C61666F6E7461696E6520746573746E6574010818CA5839BE4602100400010001030E02000203BECDA89AE3CDEBB68401076572676F726566050003106572676F2D746573746E65742D352E3001085E17C66ACE0802100400010001030D02000203C5AC9DCFF6DBCF980D076572676F7265660500050962616C622D6E6F64650108C63A60C3BE4603100400010001030E02000203B9F4C8ACFD85F9EFDF01041A19687474703A2F2F3139382E35382E39362E3139353A39303532076572676F726566050006126572676F2D746573746E65742D352E302E340108339E3681BE4602100400010001030E02000203E2D0BF82CDD7B7828201076572676F7265660500060B7265716C657A2D746E2D310108A88AB9D7BE4603100400010001030E020002038CA2A7EBF7E68DF2CA01041C1B687474703A2F2F3136382E3133382E3138352E3231353A39303532076572676F7265660500070F6572676F6E6F6465546573746E6574010849C0C081BE4602100400010001030D02000203D8EFFFDB95EEAE9535076572676F726566050007206572676F2D6E6F64652D746573746E65742D7765752E7A6F6F6D6F75742E696F01082F57E6DFBE4603100400010001030D020002038DDEEFD5FBBF969D3704292868747470733A2F2F6572676F2D6E6F64652D746573746E65742D7765752E7A6F6F6D6F75742E696F076572676F726566050007206572676F2D6E6F64652D746573746E65742D7775732E7A6F6F6D6F75742E696F01083351DF2CBE4603100400010001030E0200020393CAFFC4A3D1D3AFD00104292868747470733A2F2F6572676F2D6E6F64652D746573746E65742D7775732E7A6F6F6D6F75742E696F076572676F726566040068126572676F2D746573746E65742D342E302E300108C3C95273BD4602100400010001030E02000203DBF596F4C4D4C7D39001076572676F726566050003106572676F2D746573746E65742D352E3001085E17C66ACC0802100400010001030D0200020396F5CEC5F0EF92F91F076572676F7265660500070B7265716C657A2D746E2D320108C0EAC4A5BE4603100400010001030D02000203EEA0F2CAC29CDCD33B041C1B687474703A2F2F3139322E3233342E3139362E3136353A39303532076572676F7265660500030E6572676F2D746573746E65742D6501083359287ABE4602100400010001030E02000203C1BEAA9BFD9DA6DDFE01076572676F7265660500020B62616C622D6E6F64652D31010868ED8B4EBE4603100400010001030E020002038CA8CCBFB7BED4F6C801041B1A687474703A2F2F3130342E3233372E3133392E37383A39303532";
  const bytes = hexToBytes(hexData);
  const reader = await ScorexReader.create(bytes);
  const msg = RawNetworkMessage.decode(reader);

  assertEquals(msg.magicBytes, new Uint8Array([2, 0, 2, 3])); // testnet
  assertEquals(msg.code, 2); // `Peers` message
  assertEquals(msg.bodyLength, 1098);
  assertEquals(msg.checksum, new Uint8Array([193, 202, 176, 103]));

  console.log(bytesToHex(msg.body));

  // "peers" message with 14 specs
});
