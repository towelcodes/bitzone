import type { PageServerLoad } from "./$types";
import { verifySession } from "$lib/server/session";
import { DISCORD_SESSION_SECRET } from "$env/static/private";

export const load: PageServerLoad = async ({ cookies }) => {
  const user = await verifySession(cookies.get("session"), DISCORD_SESSION_SECRET);

  return {
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