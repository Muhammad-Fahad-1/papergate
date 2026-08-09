export async function sealDocument(text: string): Promise<{ hash: string; sealedAt: string }> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { hash, sealedAt: new Date().toISOString() };
}

export async function verifyDocument(text: string, expectedHash: string): Promise<boolean> {
  const { hash } = await sealDocument(text);
  return hash === expectedHash;
}