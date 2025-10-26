import { exitHook } from "@luludev/exit";
import { IntentsBitField as Intents } from "discord.js";
import { Client } from "discordx";
import { env, IS_DEV } from "~/env.js";
import {
  action,
  rootContext as ctxField,
  logger,
  userField,
} from "~/logger.js";
import { getVersion } from "~/version.js";

const client = new Client({
  silent: true,
  intents: [
    Intents.Flags.Guilds,
    Intents.Flags.GuildMessages,
    Intents.Flags.GuildMembers,
  ],
  botGuilds: IS_DEV ? [env.GUILD_ID] : [],
});

client.once("clientReady", async () => {
  await client.guilds.fetch();
  await client.initApplicationCommands();

  const guild = await client.guilds.fetch(env.GUILD_ID);
  logger.info({
    ...action("ready"),
    user: userField(client.user!),
    guild: {
      id: env.GUILD_ID,
      name: guild.name,
    },
  });
});

client.on("interactionCreate", (interaction) => {
  void client.executeInteraction(interaction);
});

export const run = async () => {
  const version = await getVersion();
  logger.info({
    ...ctxField("boot"),
    version,
    environment: IS_DEV ? "dev" : "prod",
  });

  await Promise.all([
    import("~/commands/index.js"),
    import("~/handlers/index.js"),
  ]);

  await client.login(env.TOKEN);
};

exitHook(async (exit) => {
  await client.destroy();
  exit();
});
