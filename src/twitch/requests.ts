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
  clientId,
}: {
  channels: string[];
  token: string;
  clientId: string;
}) {
  const params = new URLSearchParams();
  for (const participant of channels) {
    params.append("login", participant);
  }

  return (
    await (
      await fetch(`https://api.twitch.tv/helix/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      })
    ).json<{ data: TwitchBroadcaster[] }>()
  ).data;
}

export async function getChannelBadges({
  userId,
  token,
  clientId,
}: {
  userId: string;
  token: string;
  clientId: string;
}) {
  const response = await fetch(
    `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  );
  const json = (await response.json()) as BadgesResponse;
  return json.data;
}

export async function getGlobalBadges({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  const response = await fetch(
    `https://api.twitch.tv/helix/chat/badges/global`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
    }
  );
  const json = (await response.json()) as BadgesResponse;
  return json.data;
}
