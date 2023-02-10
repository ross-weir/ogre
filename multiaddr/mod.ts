import { multiaddr } from "../deps.ts";

// Really really naive way to convert a "127.0.0.1:port" type string to multiAddr
// the uri-to-multiaddr npm package doesn't work because it uses functions not supported by Deno
// This is good enough to transform the uris returned from the C# bridge but won't work for much else yet
export function toMultiaddr(uri: string) {
  const [host, port] = uri.split(":");

  return multiaddr(`/ip4/${host}/tcp/${port}`);
}
