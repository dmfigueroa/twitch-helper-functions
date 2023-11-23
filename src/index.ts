import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { z } from "zod";
import { getUsersData } from "./twitch/requests";
import { getTwitchToken } from "./twitch/token";

type Environment = {
  TWITCH_CLIENT_SECRET: string;
  TWITCH_CLIENT_ID: string;
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
    console.log("test");
    const env = c.env as Environment;
    const clientId = env.TWITCH_CLIENT_ID;

    const token = await getTwitchToken({
      clientId: clientId,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    });

    const usersData = await getUsersData({
      channels: [c.req.valid("param").login],
      token,
      clientId: clientId,
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

    const token = await getTwitchToken({
      clientId: clientId,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    });

    const usersData = await getUsersData({
      channels: [c.req.valid("param").login],
      token,
      clientId: clientId,
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
    const clientId = env.TWITCH_CLIENT_ID;

    const token = await getTwitchToken({
      clientId: clientId,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    });

    const usersData = await getUsersData({
      channels: [c.req.valid("param").login],
      token,
      clientId: clientId,
    });

    const userId = usersData[0].id;

    const response = await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${userId}`
    );
    const json = await response.json();
    return c.json(json);
  }
);

export default app;
