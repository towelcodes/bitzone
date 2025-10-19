import { redirect } from "@sveltejs/kit";
import { get } from "$lib/server/s3";
import { S3_BUCKET } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

export const GET: RequestHandler = async ({ request, params }) => {
  const accept = request.headers.get("accept") ?? "";
  const sec = request.headers.get("sec-fetch-mode") ?? "";
  if (accept.includes("text/html") || sec.length > 0) {
    redirect(303, `/v/${params.file}/`);
  }

  try {
    const res = await get(params.file);

    if (!res.Body) return new Response(null, { status: 404 });

    return new Response(res.Body as any, {
      headers: {
        "Content-Type": res.ContentType ?? "application/octet-stream",
        "Content-Length": res.ContentLength?.toString() ?? "",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: "not found",
      }),
      { status: 404 },
    );
  }
};
