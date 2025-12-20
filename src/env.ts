import "@luludev/env/register";
import { defineEnvironment, t } from "@luludev/env";

export const env = defineEnvironment({
  // #region Globals
  NODE_ENV: t.string(),

  DEBUG_LOGS: t.bool(),
  GIT_SHA: t.string(),
  GITHUB_REPO: t.string(),
  // #endregion

  // #region Bot
  TOKEN: t.string().required(),
  GUILD_ID: t.string().required(),
  // #endregion

  TEAMSPEAK_URI: t.string(),
  TEAMSPEAK_USERS: t.string(),

  LANDMINE_EXEMPT_CHANNELS: t.string(),
});

const IS_PROD = env.NODE_ENV?.toLowerCase() === "production";
export const IS_DEV = !IS_PROD;
