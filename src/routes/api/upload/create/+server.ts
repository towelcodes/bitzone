import type { RequestHandler } from "./$types";
import { S3_ENDPOINT, S3_BUCKET } from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { env } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";
import { client, createUniqueId } from "$lib/server/s3";
import { getFilesRepo } from "$lib/server/get-files-repo";
import { verifySession } from "$lib/server/session";
import { DISCORD_SESSION_SECRET } from "$env/static/private";
import { prettyNumber } from "$lib/util";
import { error } from "@sveltejs/kit";

interface UploadRequest {
  filename: string;
  key?: string;
  size: number;
  title?: string;
  description?: string;
  expiry?: number; // seconds, or -1 for never
  preserveFilename?: boolean;
  capToken?: string;
}

export const POST: RequestHandler = async ({
  request,
  getClientAddress,
  platform,
  cookies,
}) => {
  let uploadRequest: UploadRequest;
  try {
    uploadRequest = await request.json();
  } catch {
    error(400, {
      message: "missing json body",
    });
  }

  if (uploadRequest.size == undefined) {
    error(400, {
      message: "missing `size` property",
    });
  } else if (env.PUBLIC_MAX_SIZE != undefined) {
    if (uploadRequest.size > parseInt(env.PUBLIC_MAX_SIZE)) {
      error(413, {
        message: "content is larger than this instance supports",
      });
    }
  }

  // verify the cap captcha token when the captcha is enabled
  const capSecret = privateEnv.CAP_SECRET_KEY;
  const capEndpoint = env.PUBLIC_CAP_ENDPOINT;
  if (capSecret && capEndpoint) {
    if (!uploadRequest.capToken) {
      error(400, {
        message: "missing captcha token",
      });
    }

    const verifyUrl = `${capEndpoint.replace(/\/?$/, "/")}siteverify`;
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: capSecret,
        response: uploadRequest.capToken,
      }),
    });

    const verify = (await verifyRes.json()) as {
      success?: boolean;
      error?: string;
    };
    if (!verify.success) {
      error(403, {
        message: `captcha verification failed: ${verify.error ?? "unknown"}`,
      });
    }
  }

  const key =
    uploadRequest.key ??
    (await createUniqueId()) + `.${uploadRequest.filename.split(".").at(-1)}`;
  const size = uploadRequest.size;

  // persist metadata so files can be queried and expired later
  const repo = getFilesRepo(platform);
  const user = await verifySession(
    cookies.get("session"),
    DISCORD_SESSION_SECRET,
  );
  const expiresAt =
    uploadRequest.expiry != undefined && uploadRequest.expiry > 0
      ? Date.now() + uploadRequest.expiry * 1000
      : null;
  await repo.create({
    key,
    // keep the original filename only when requested; otherwise use the key
    filename: uploadRequest.preserveFilename
      ? uploadRequest.filename
      : key,
    size,
    contentType: "application/octet-stream",
    uploaderId: user?.id ?? "anonymous",
    title: uploadRequest.title,
    description: uploadRequest.description,
    expiresAt,
    createdAt: Date.now(),
  });

  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const signed = await client.sign(
    new Request(url, {
      method: "PUT",
      headers: {
        "Content-Length": `${size}`,
      },
    }),
    {
      aws: { signQuery: true },
    },
  );

  console.log("Created upload", { ip: getClientAddress() });

  // log to webhook if enabled
  if (privateEnv.UPLOAD_WEBHOOK != undefined) {
    try {
      await fetch(privateEnv.UPLOAD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: `upload created | ${key}`,
              fields: [
                {
                  name: "size",
                  value: prettyNumber(size),
                },
                {
                  name: "ip",
                  value: getClientAddress(),
                },
                {
                  name: "link",
                  value: `${PUBLIC_BASE_URL}/u/${key}`,
                },
              ],
              image: {
                url: `${PUBLIC_BASE_URL}/u/${key}`,
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.warn("sending webhook failed: ", e);
    }
  }

  return new Response(
    JSON.stringify({
      key,
      signed: signed.url,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
