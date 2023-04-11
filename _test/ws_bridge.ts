import { Application, Router } from "https://deno.land/x/oak@v12.0.0/mod.ts";
import { base64Decode, base64Encode } from "../deps.ts";
import {
  CloseRequestParams,
  DialRequestParams,
  DialResponseParams,
  NoOpParams,
  ReceiveDataParams,
  RpcMethod,
  RpcPayload,
  WriteDataRequestParams,
  WriteDataResponseParams,
} from "../transports/bridges/web_socket/rpc.ts";

const idToConnMap: Record<string, Deno.TcpConn> = {};

function denoAddrToStr(addr: Deno.Addr) {
  const a = addr as Deno.NetAddr;

  return `${a.hostname}:${a.port}`;
}

function manageWebsocket(ws: WebSocket) {
  async function onDialRequest(
    { host, port, connId }: DialRequestParams,
    msgId: string,
  ) {
    try {
      const conn = await Deno.connect({ hostname: host, port });
      idToConnMap[connId] = conn;

      const params: DialResponseParams = {
        connId,
        localAddr: denoAddrToStr(conn.localAddr),
        remoteAddr: denoAddrToStr(conn.remoteAddr),
      };
      const dialResponse: RpcPayload = {
        id: msgId,
        method: RpcMethod.DialResponse,
        params,
      };
      ws.send(JSON.stringify(dialResponse));

      for await (const data of conn.readable) {
        const params: ReceiveDataParams = { connId, data: base64Encode(data) };
        const msg: RpcPayload = {
          id: crypto.randomUUID(),
          method: RpcMethod.ReceiveData,
          params,
        };

        ws.send(JSON.stringify(msg));
      }
    } catch (e) {
      console.log(`Error occurred: ${e}`);
    }
  }

  async function onWriteDataRequest(
    { connId, data }: WriteDataRequestParams,
    msgId: string,
  ) {
    const conn = idToConnMap[connId];

    if (!conn) {
      return;
    }

    const bytesWritten = await conn.write(base64Decode(data));
    const params: WriteDataResponseParams = { connId, bytesWritten };
    const msg: RpcPayload = {
      id: msgId,
      method: RpcMethod.WriteDataResponse,
      params,
    };

    ws.send(JSON.stringify(msg));
  }

  function onCloseRequest(
    { connId }: CloseRequestParams,
    msgId: string,
  ) {
    const conn = idToConnMap[connId];

    if (!conn) {
      return;
    }

    conn.close();

    const params: NoOpParams = {};
    const msg: RpcPayload = {
      id: msgId,
      method: RpcMethod.CloseResponse,
      params,
    };

    ws.send(JSON.stringify(msg));
  }

  ws.addEventListener("message", (msg: MessageEvent) => {
    const data = JSON.parse(msg.data) as RpcPayload;

    switch (data.method) {
      case RpcMethod.DialRequest:
        onDialRequest(data.params as DialRequestParams, data.id);
        break;
      case RpcMethod.WriteDataRequest:
        onWriteDataRequest(data.params as WriteDataRequestParams, data.id);
        break;
      case RpcMethod.CloseRequest:
        onCloseRequest(data.params as CloseRequestParams, data.id);
        break;
      default:
        break;
    }
  });
}

export function startBridgeApp(signal: AbortSignal, port = 8109) {
  const app = new Application();
  const router = new Router();

  router.get("/", (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501);
    }

    const ws = ctx.upgrade();

    manageWebsocket(ws);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen({ port, signal });

  return app;
}

const controller = new AbortController();
startBridgeApp(controller.signal);
