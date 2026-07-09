export function randomHash(bytesLength = 6) {
  const bytes = new Uint8Array(bytesLength);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomUUID() {
  return globalThis.crypto?.randomUUID?.() ?? randomHash(16);
}
