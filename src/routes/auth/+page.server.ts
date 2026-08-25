import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { signSession } from "$lib/server/session";
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_SESSION_SECRET,
} from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";

const AUTH_URL = "https://discord.com/api/oauth2/authorize";
const TOKEN_URL = "https://discord.com/api/oauth2/token";
const USER_URL = "https://discord.com/api/users/@me";
const REDIRECT_URI = `${PUBLIC_BASE_URL}/auth`;

export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // no code yet -> start the OAuth flow
  if (!code) {
    const state = crypto.randomUUID();
    cookies.set("oauth_state", state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    });

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: "identify",
      state,
    });
    redirect(302, `${AUTH_URL}?${params}`);
  }

  // validate the state to prevent CSRF
  if (state !== cookies.get("oauth_state")) {
    redirect(303, "/");
  }
  cookies.delete("oauth_state", { path: "/" });

  // exchange the code for an access token
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Discord token exchange failed", {
      status: tokenRes.status,
      text: await tokenRes.text(),
    });
    redirect(303, "/");
  }

  const token = await tokenRes.json();

  // fetch the user's profile
  const userRes = await fetch(USER_URL, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  if (!userRes.ok) {
    console.error("Discord user fetch failed", {
      status: userRes.status,
      text: await userRes.text(),
    });
    redirect(303, "/");
  }

  const user = await userRes.json();

  const session = await signSession(
    {
      id: user.id,
      username: user.username,
      display_name: user.global_name ?? user.username,
      avatar: user.avatar,
      email: user.email ?? null,
    },
    DISCORD_SESSION_SECRET,
  );

  cookies.set("session", session, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect(303, "/");
};