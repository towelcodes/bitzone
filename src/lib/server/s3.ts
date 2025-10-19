import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from "$env/static/private";

export const client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export async function put(data: Buffer, type: string, name?: string) {
  const key = name ?? (await createUniqueId());
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: type,
    }),
  );
  return key;
}

export async function get(key: string) {
  return await client.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
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
    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: S3_BUCKET,
          Key: id,
        }),
      );
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404) return id;
      throw err;
    }
  }
}
