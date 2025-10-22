import type { RequestHandler } from "./$types";
import { put } from "$lib/server/s3";

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file || !(file instanceof File))
    return new Response(JSON.stringify({ message: "no file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  const key = await put(file.stream(), file.type);

  return new Response(
    JSON.stringify({
      key,
    }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
