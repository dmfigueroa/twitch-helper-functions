export async function getTwitchToken({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) {
  const body = new FormData();
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
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
  return json.access_token;
}
