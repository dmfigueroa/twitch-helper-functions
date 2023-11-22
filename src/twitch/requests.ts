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
