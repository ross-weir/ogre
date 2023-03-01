import { assertEquals } from "../test_deps.ts";
import { ScorexReader, ScorexWriter } from "./scorex_buffer.ts";

Deno.test("[io/scorex_buffer] ScorexWriter & ScorexReader", () => {
  const w = new ScorexWriter();

  w.putInt32(5);
  w.putInt32(1);
  w.putInt32(100);

  const r = new ScorexReader(w.buffer);

  assertEquals(r.getInt32(), 5);
  assertEquals(r.getInt32(), 1);
  assertEquals(r.getInt32(), 100);
});

Deno.test("[io/scorex_buffer] Write & Read string", () => {
  const w = new ScorexWriter();

  w.putString("hello world");

  const r = new ScorexReader(w.buffer);

  assertEquals(r.getString(), "hello world");
});

Deno.test("[io/scorex_buffer] Write & Read complex types", () => {
  const w = new ScorexWriter();

  w.putUint64(50012144444n);
  w.putInt8(1);
  w.putString("ErGonde");
  w.putUint16(255);

  const r = new ScorexReader(w.buffer);

  assertEquals(r.getUint64(), 50012144444n);
  assertEquals(r.getInt8(), 1);
  assertEquals(r.getString(), "ErGonde");
  assertEquals(r.getUint16(), 255);
});
