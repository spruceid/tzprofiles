import type { Hash, Content } from '../storage';

export default async function hasher(content: Content): Promise<Hash> {
  const claimString = JSON.stringify(content);
  const encodedString = new TextEncoder().encode(claimString);
  const buf = await crypto.subtle.digest('SHA-256', encodedString);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
