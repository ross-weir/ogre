import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { preview } from "vite";
import type { PreviewServer } from "vite";
import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";
import type { NodeState } from "../src/App";

describe("Test node execution end to end", async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  async function getNodeState(): Promise<NodeState> {
    const stateEl = await page.waitForSelector("#node-state");
    expect(stateEl).toBeDefined();
    const stateStr = await page.evaluate(
      (element) => element!.textContent,
      stateEl
    );

    return JSON.parse(stateStr!);
  }

  async function waitForNodeState(
    step: string,
    checker: (currentState: NodeState) => boolean,
    timeoutMs: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        reject(step);
      }, timeoutMs);

      const intervalId = setInterval(async () => {
        const nodeState = await getNodeState();

        if (checker(nodeState)) {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          resolve();
        }
      }, 250);
    });
  }

  beforeAll(async () => {
    server = await preview({ preview: { port: 3000 } });
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it(
    "should reach the desired state",
    async () => {
      try {
        await waitForNodeState(
          "Connected to a peer",
          (s) => s.connectedPeers > 0,
          60_000 * 5
        );
      } catch (e) {
        console.error(e);
        expect(e).toBeUndefined();
      }
    },
    60_000 * 5
  );
});
