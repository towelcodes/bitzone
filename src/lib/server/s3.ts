import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

export const client = new S3Client({
  endpoint: env.S3_ENDPOINT!!,
  region: "auto",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID!!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!!,
  },
});

export async function put(data: Buffer, type: string, name?: string) {
  const key = name ?? (await createUniqueId());
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
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
      Bucket: env.S3_BUCKET,
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
          Bucket: env.S3_BUCKET,
          Key: id,
        }),
      );
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404) return id;
      throw err;
    }
  }
}
