export const enum RpcMethod {
  DialRequest = "dialRequest",
  DialResponse = "dialResponse",
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

interface RequestToParamsMap {
  [RpcMethod.DialRequest]: DialRequestParams;
  [RpcMethod.WriteDataRequest]: WriteDataRequestParams;
}

interface ResponseToParamsMap {
  [RpcMethod.DialResponse]: DialResponseParams;
  [RpcMethod.WriteDataResponse]: WriteDataResponseParams;
}

export interface MethodToResponseMap {
  [RpcMethod.DialRequest]: RpcMethod.DialResponse;
  [RpcMethod.WriteDataRequest]: RpcMethod.WriteDataResponse;
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
