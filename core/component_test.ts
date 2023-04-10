import { assertEquals } from "../test_deps.ts";
import { Component } from "./component.ts";

class TestComponent extends Component {}

Deno.test("[core/component] beforeStart default impl is a no-op", async () => {
  const t = new TestComponent();

  assertEquals(await t.beforeStart(), undefined);
});

Deno.test("[core/component] start default impl is a no-op", async () => {
  const t = new TestComponent();

  assertEquals(await t.start(), undefined);
});

Deno.test("[core/component] stop default impl is a no-op", async () => {
  const t = new TestComponent();

  assertEquals(await t.stop(), undefined);
});
