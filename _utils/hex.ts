export function hexToBytes(hex: string) {
  return new Uint8Array(
    hex.match(/[\da-f]{2}/gi)!.map(function (h) {
      return parseInt(h, 16);
    }),
  );
}

export function bytesToHex(arr: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < arr.length; i++) {
    let hexValue = arr[i].toString(16);
    if (hexValue.length === 1) {
      hexValue = "0" + hexValue;
    }
    hex += hexValue;
  }
  return hex;
}

/**
 * Check if the provided hex string is digest of the expected length.
 * @param len Expected length of the digest.
 * @returns Bool if the digest is of expected length.
 */
export function isDigestWithLen(len: number) {
  return function (hex: string) {
    return hexToBytes(hex).byteLength === len;
  };
}
