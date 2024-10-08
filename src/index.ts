import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  getChannelBadges,
  getChannelId,
  getGlobalBadges,
  getUsersData,
} from "./twitch/requests";
import { getTwitchToken } from "./twitch/token";

export type Environment = {
  TWITCH_CLIENT_SECRET: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_HELPER_KV: KVNamespace;
};

const app = new Hono();

app.use("*", cors());

app.get(
  "/user/picture/:login",
  zValidator(
    "param",
    z.object({
      login: z.string(),
    })
  ),
  cache({
    cacheName: "warmon-twitch-user-picture",
    cacheControl: "max-age=600",
  }),
  async (c) => {
    const env = c.env as Environment;
    const clientId = env.TWITCH_CLIENT_ID;

    const token = await getTwitchToken(env);

    const usersData = await getUsersData({
      channels: [c.req.valid("param").login],
      token,
      env,
    });

    const imageResponse = await fetch(usersData[0].profile_image_url);

    return c.newResponse(imageResponse.body, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  }
);

app.get(
  "/user/id/:login",
  zValidator(
    "param",
    z.object({
      login: z.string(),
    })
  ),
  async (c) => {
    const env = c.env as Environment;
    const clientId = env.TWITCH_CLIENT_ID;

    const token = await getTwitchToken(env);

    const usersData = await getUsersData({
      channels: [c.req.valid("param").login],
      token,
      env,
    });

    return c.json({
      id: usersData[0].id,
    });
  }
);

app.get(
  "/betterttv-emotes/:login",
  zValidator(
    "param",
    z.object({
      login: z.string(),
    })
  ),
  async (c) => {
    const env = c.env as Environment;

    const token = await getTwitchToken(env);

    const userId = await getChannelId({
      login: c.req.valid("param").login,
      token,
      env,
    });

    const response = await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${userId}`
    );
    const json = await response.json();
    return c.json(json);
  }
);

app.get(
  "/channels/:login/badges/:set_id/:id",
  zValidator(
    "param",
    z.object({
      id: z.string(),
      set_id: z.string(),
      login: z.string(),
    })
  ),
  cache({
    cacheName: "warmon-twitch-badge-picture",
    cacheControl: "max-age=600",
  }),
  async (c) => {
    const env = c.env as Environment;
    const clientId = env.TWITCH_CLIENT_ID;

    const token = await getTwitchToken(env);

    const userId = await getChannelId({
      login: c.req.valid("param").login,
      token,
      env,
    });

    const [badges, globalBadges] = await Promise.all([
      getChannelBadges({
        userId,
        token,
        env,
      }),
      getGlobalBadges({
        token,
        env,
      }),
    ]);

    let badgeUrl = badges
      .find((badge) => badge.set_id === c.req.valid("param").set_id)
      ?.versions.find(
        (version) => version.id === c.req.valid("param").id
      )?.image_url_4x;

    badgeUrl ??= globalBadges
      .find((badge) => badge.set_id === c.req.valid("param").set_id)
      ?.versions.find(
        (version) => version.id === c.req.valid("param").id
      )?.image_url_4x;

    if (!badgeUrl) {
      return c.newResponse("Not found", {
        status: 404,
      });
    }

    const imageResponse = await fetch(badgeUrl);

    return c.newResponse(imageResponse.body, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  }
);

export default app;
