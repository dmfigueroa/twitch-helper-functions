import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

app.get("/user-id", (c) => c.text("Hello Hono!"));

export default app;
