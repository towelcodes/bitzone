import {
  S3_ENDPOINT,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_PUBLIC,
} from "$env/static/private";
import { AwsClient } from "aws4fetch";

export const client = new AwsClient({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
});

export async function getPublicUrl(key: string): Promise<string | undefined> {
  if (!(await check(key))) {
    return undefined;
  }

  return `${S3_PUBLIC}/${key}`;
}

export async function put(
  data: ArrayBuffer,
  contentType: string,
  options?: {
    key?: string;
    metadata?: Record<string, string>;
  },
) {
  const k = options?.key ?? (await createUniqueId());
  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${k}`);
  const res = await client.fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: data,
  });
  if (res.status != 200) {
    console.error(`Non 200 status while putting ${k}:`, {
      status: res.status,
      statusText: res.statusText,
      text: await res.text(),
    });
  }
  return res;
}

export async function get(key: string) {
  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const res = await client.fetch(url, {
    method: "GET",
  });
  if (res.status == 404) {
    return undefined;
  }
  if (res.status == 200) {
    return res;
  } else {
    console.error(`Unexpected response while getting ${key}:`, {
      statusText: res.statusText,
      status: res.status,
      text: await res.text(),
    });
    return undefined;
  }
}

export async function check(key: string) {
  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const res = await client.fetch(url, {
    method: "HEAD",
  });
  if (res.status == 404) {
    return undefined;
  }
  if (res.status == 200) {
    return res;
  } else {
    console.error(`Unexpected response while checking ${key}:`, {
      statusText: res.statusText,
      status: res.status,
      text: await res.text(),
    });
    return undefined;
  }
}

export async function remove(key: string) {
  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const res = await client.fetch(url, {
    method: "DELETE",
  });
  if (res.status != 204 && res.status != 200) {
    console.error(`Unexpected response while deleting ${key}:`, {
      statusText: res.statusText,
      status: res.status,
      text: await res.text(),
    });
  }
  return res;
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function createId(len = 5) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function createUniqueId() {
  for (;;) {
    const id = createId(5);
    if ((await check(id)) == null) {
      return id;
    }
  }
}

export function getAmzDate() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const amzDate = `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
  const dateStamp = `${yyyy}${mm}${dd}`;
  return { amzDate, dateStamp };
}
