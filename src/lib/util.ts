export function isBrowser(headers: Headers): boolean {
  const userAgent = headers.get("user-agent") ?? "";
  // if the user agent is discordbot, always return the file content
  if (userAgent.includes("Discordbot")) {
    return false;
  }

  const accept = headers.get("accept") ?? "";
  const sec = headers.get("sec-fetch-mode") ?? ""; // sec.length > 0
  if (accept.includes("text/html")) {
    return true;
  }
  return false;
}

const byteToHex: string[] = [];

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, "0");
  byteToHex.push(hexOctet);
}

// thank you https://stackoverflow.com/questions/40031688/how-can-i-convert-an-arraybuffer-to-a-hexadecimal-string-hex
export function hex(arrayBuffer: ArrayBuffer) {
  const buff = new Uint8Array(arrayBuffer);
  const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

  for (let i = 0; i < buff.length; ++i) hexOctets.push(byteToHex[buff[i]]);

  return hexOctets.join("");
}

export async function hmacSign(keyStr: string, msg: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createUpload(
  size: number,
  filename: string,
  key?: string,
  options?: {
    title?: string;
    description?: string;
    expiry?: number; // seconds, or -1 for never
  },
) {
  const body = {
    size,
    filename,
    key,
    title: options?.title,
    description: options?.description,
    expiry: options?.expiry,
  };
  const res = await fetch("/api/upload/create", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status != 200) {
    console.error(res);
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return {
    key: json.key,
    signed: json.signed,
  };
}

export function prettyNumber(n: number, precision: number = 2) {
  const trunc = Math.trunc(n);
  const len = (Math.log(trunc) * Math.LOG10E + 1) | 0;
  if (len < 4) {
    return n.toString();
  } else if (len >= 4 && len < 7) {
    return `${(n / 10 ** 3).toFixed(precision)}K`;
  } else if (len >= 7 && len < 10) {
    return `${(n / 10 ** 6).toFixed(precision)}M`;
  } else if (len >= 10 && len < 13) {
    return `${(n / 10 ** 9).toFixed(precision)}G`;
  } else {
    return `${(n / 10 ** 12).toFixed(precision)}T`;
  }
}
