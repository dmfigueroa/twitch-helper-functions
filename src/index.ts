import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getTwitchToken } from "./twitch/token";
import { getUsersData } from "./twitch/requests";
import { cors } from "hono/cors";

type Environment = {
  TWITCH_CLIENT_SECRET: string;
  TWITCH_CLIENT_ID: string;
};

const app = new Hono();

app.use("*", cors());

app.get(
  "/user-id/:login",
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
