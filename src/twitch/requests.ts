import { Environment } from "..";
import { fetchWithRetry } from "./token";

type TwitchBroadcaster = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
};

type BadgesResponse = {
  data: {
    set_id: string;
    versions: {
      id: string;
      image_url_1x: string;
      image_url_2x: string;
      image_url_4x: string;
      title: string;
      description: string;
      click_action: string;
      click_url: string;
    }[];
  }[];
};

export async function getUsersData({
  channels,
  token,
  env,
}: {
  channels: string[];
  token: string;
  env: Environment;
}) {
  const params = new URLSearchParams();
  for (const participant of channels) {
    params.append("login", participant);
  }

  return (
    await (
      await fetchWithRetry(
        `https://api.twitch.tv/helix/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Client-Id": env.TWITCH_CLIENT_ID,
          },
        },
        env
      )
    ).json<{ data: TwitchBroadcaster[] }>()
  ).data;
}

export async function getChannelBadges({
  userId,
  token,
  env,
}: {
  userId: string;
  token: string;
  env: Environment;
}) {
  const response = await fetchWithRetry(
    `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    },
    env
  );
  const json = (await response.json()) as BadgesResponse;
  return json.data;
}

export async function getGlobalBadges({
  token,
  env,
}: {
  token: string;
  env: Environment;
}) {
  const response = await fetchWithRetry(
    `https://api.twitch.tv/helix/chat/badges/global`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    },
    env
  );
  const json = (await response.json()) as BadgesResponse;
  return json.data;
}

export async function getChannelId({
  login,
  token,
  env,
}: {
  login: string;
  token: string;
  env: Environment;
}) {
  const cachedId = await env.TWITCH_HELPER_KV.get(`twitch-id-${login}`);
  if (cachedId) {
    return cachedId;
  }

  const usersData = await getUsersData({
    channels: [login],
    token,
    env,
  });

  await env.TWITCH_HELPER_KV.put(`twitch-id-${login}`, usersData[0].id, {
    expirationTtl: 60 * 60 * 24 * 7, //
  });

  return usersData[0].id;
}
