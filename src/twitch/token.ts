import { Environment } from "..";

export async function getTwitchToken(env: Environment) {
  console.log(env.TWITCH_HELPER_KV);
  const cachedToken = await env.TWITCH_HELPER_KV.get("twitch-token");
  if (cachedToken) {
    return cachedToken;
  }

  const body = new FormData();
  body.append("client_id", env.TWITCH_CLIENT_ID);
  body.append("client_secret", env.TWITCH_CLIENT_SECRET);
  body.append("grant_type", "client_credentials");

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body,
  });
  const json = await response.json<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }>();

  await env.TWITCH_HELPER_KV.put("twitch-token", json.access_token, {
    expirationTtl: json.expires_in,
  });

  return json.access_token;
}
