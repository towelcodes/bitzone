import { hmacSign } from "$lib/util";

export interface DiscordUser {
  id: string;
  username: string;
  display_name?: string | null;
  avatar?: string | null;
  email?: string | null;
}

/**
 * Sign a payload into a tamper-evident cookie value.
 * The payload is base64-encoded and HMAC-signed so it can't be modified
 * without invalidating the signature.
 */
export async function signSession(
  data: unknown,
  secret: string,
): Promise<string> {
  const json = JSON.stringify(data);
  const b64 = btoa(json);
  const sig = await hmacSign(secret, b64);
  return `${b64}.${sig}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<DiscordUser | null> {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;

  const expected = await hmacSign(secret, b64);
  if (sig !== expected) return null;

  try {
    return JSON.parse(atob(b64)) as DiscordUser;
  } catch {
    return null;
  }
}