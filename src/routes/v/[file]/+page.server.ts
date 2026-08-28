import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { isBrowser } from "$lib/util";
import { check, getPublicUrl } from "$lib/server/s3";
import { verifySession } from "$lib/server/session";
import { DISCORD_SESSION_SECRET } from "$env/static/private";

export const load: PageServerLoad = async ({ params, request, cookies }) => {
  if (!isBrowser(request.headers)) {
    redirect(303, `/u/${params.file}`);
  }

  // fetch the file
  const object = await check(`${params.file}`);

  if (object == null) {
    return error(404, "Not found");
  }

  // check login
  const user = await verifySession(cookies.get("session"), DISCORD_SESSION_SECRET);

  return {
    file: params.file,
    lastModified: object.headers.get("Last-Modified"),
    size: parseInt(object.headers.get("Content-Length")!!),
    uploader: "anonymous",
    raw: await getPublicUrl(`${params.file}`),
    contentType:
      object.headers.get("Content-Type") ?? "application/octet-stream",
      user: user
        ? {
            displayName: user.display_name ?? user.username,
            avatarUrl: user.avatar
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              : undefined,
          }
        : null,
  };
};
