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
import { base64Decode, base64Encode } from "../../deps.ts";

export function createReadableStream(
  ws: WebSocket,
  connId: string,
): ReadableStream<Uint8Array> {
  function waitForDataMessageForConnId(): Promise<Uint8Array> {
    return new Promise((resolve) => {
      const listener = (evt: MessageEvent) => {
        const msg = JSON.parse(evt.data) as RpcPayload;

        if (msg.method !== RpcMethod.ReceiveData) {
          return;
        }

        const { connId: dataConnId, data } = msg.params as ReceiveDataParams;

        if (connId !== dataConnId) {
          return;
        }

        // TODO: instead of adding/removing listeners could just keep track to see if a listener
        // has been added for this connId.
        ws.removeEventListener("message", listener);

        resolve(base64Decode(data));
      };

      ws.addEventListener("message", listener);
    });
  }

  return new ReadableStream({
    type: "bytes",
    async pull(controller) {
      const chunk = await waitForDataMessageForConnId();

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
