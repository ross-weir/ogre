import { multiaddr } from "../deps.ts";

/**
 * Convert a string to a multiaddr instance.
 * Very naive implementation and will only work for
 * "host:port" formatted strings. Always assumes
 * the string is a raw TCP address.
 *
 * @param uri Uri in "host:port" format
 * @returns The converted multiaddr
 */
export function toMultiaddr(uri: string) {
  const [host, port] = uri.split(":");

  return multiaddr(`/ip4/${host}/tcp/${port}`);
}
