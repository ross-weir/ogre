/**
 * Wrap the websocket connection in read & write streams.
 *
 * We do this so the websocket bridge can have a interface compatible with TCP streams in Deno
 * so the transport can be swapped in/out polymorphically.
 *
 * Maybe one day WebsocketStreams will be standardized and we can remove this scuffed impl:
 * https://developer.chrome.com/articles/websocketstream/
 */
import {
  ReceiveDataParams,
  RpcMethod,
  RpcPayload,
  sendAndForget,
} from "./rpc.ts";
import { base64Decode, base64Encode } from "../../../deps.ts";

export function createReadableStream(
  ws: WebSocket,
  connId: string,
): ReadableStream<Uint8Array> {
  const backlog: Uint8Array[] = [];

  ws.addEventListener("message", (evt: MessageEvent) => {
    const msg = JSON.parse(evt.data) as RpcPayload;

    if (msg.method !== RpcMethod.ReceiveData) {
      return;
    }

    const { connId: dataConnId, data } = msg.params as ReceiveDataParams;

    if (connId !== dataConnId) {
      return;
    }

    backlog.push(base64Decode(data));
  });

  function pollBacklog(): Promise<Uint8Array> {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (backlog.length) {
          clearInterval(intervalId);
          resolve(backlog.shift()!);
        }
      }, 50);
    });
  }

  return new ReadableStream({
    type: "bytes",
    async pull(controller) {
      const chunk = await pollBacklog();

      controller.enqueue(chunk);
    },
    cancel() {
      // send close connection msg for uuid
    },
  });
}

export function createWritableStream(
  ws: WebSocket,
  connId: string,
): WritableStream<Uint8Array> {
  return new WritableStream({
    write(chunk) {
      sendAndForget(ws, RpcMethod.WriteDataRequest, {
        connId,
        data: base64Encode(chunk),
      });
    },
  });
}

export function createCloseStream(ws: WebSocket, connId: string) {
  return function () {
    sendAndForget(ws, RpcMethod.CloseRequest, {
      connId,
    });
  };
}
