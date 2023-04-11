export const enum RpcMethod {
  DialRequest = "dialRequest",
  DialResponse = "dialResponse",
  CloseRequest = "closeRequest",
  CloseResponse = "closeResponse",
  ReceiveData = "receiveData",
  WriteDataRequest = "writeDataRequest",
  WriteDataResponse = "writeDataResponse",
}

export interface RpcPayload {
  id: string;
  method: RpcMethod;
  params: unknown;
}

export interface DialRequestParams {
  connId: string;
  host: string;
  port: number;
}

export interface DialResponseParams {
  connId: string;
  localAddr: string;
  remoteAddr: string;
}

export interface CloseRequestParams {
  connId: string;
}

export interface WriteDataRequestParams {
  connId: string;
  data: string; // base64
}

export interface WriteDataResponseParams {
  connId: string;
  bytesWritten: number;
}

export interface ReceiveDataParams {
  connId: string;
  data: string; // base64
}

// deno-lint-ignore no-empty-interface
export interface NoOpParams {}

interface RequestToParamsMap {
  [RpcMethod.DialRequest]: DialRequestParams;
  [RpcMethod.CloseRequest]: CloseRequestParams;
  [RpcMethod.WriteDataRequest]: WriteDataRequestParams;
}

interface ResponseToParamsMap {
  [RpcMethod.DialResponse]: DialResponseParams;
  [RpcMethod.WriteDataResponse]: WriteDataResponseParams;
  [RpcMethod.CloseResponse]: NoOpParams;
}

export interface MethodToResponseMap {
  [RpcMethod.DialRequest]: RpcMethod.DialResponse;
  [RpcMethod.WriteDataRequest]: RpcMethod.WriteDataResponse;
  [RpcMethod.CloseRequest]: RpcMethod.CloseResponse;
}

export function sendAndForget<K extends keyof RequestToParamsMap>(
  ws: WebSocket,
  method: K,
  params: RequestToParamsMap[K],
) {
  const msg = {
    id: crypto.randomUUID(),
    method,
    params,
  };

  ws.send(JSON.stringify(msg));
}

export function sendAndReceive<
  K extends keyof RequestToParamsMap,
  U extends ResponseToParamsMap[MethodToResponseMap[K]],
>(
  ws: WebSocket,
  method: K,
  params: RequestToParamsMap[K],
): Promise<U> {
  function waitForResponse(
    requestId: string,
  ): Promise<U> {
    return new Promise((resolve) => {
      const listener = (evt: MessageEvent) => {
        const msg = JSON.parse(evt.data) as RpcPayload;

        if (msg.id !== requestId) {
          return;
        }

        ws.removeEventListener("message", listener);

        resolve(msg.params as U);
      };

      ws.addEventListener("message", listener);
    });
  }

  const msg = {
    id: crypto.randomUUID(),
    method,
    params,
  };

  const responsePromise = waitForResponse(msg.id);

  ws.send(JSON.stringify(msg));

  return responsePromise;
}
