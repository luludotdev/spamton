import type { CommandInteraction } from "discord.js";
import { Discord, Guild, Slash } from "discordx";
import { env } from "~/env";

@Discord()
export abstract class Repo {
  @Guild(env.GUILD_ID)
  @Slash({ name: "repo", description: "You got repo" })
  public async runRepo(ctx: CommandInteraction) {
    await ctx.reply({ content: "<https://github.com/luludotdev/spamton>" });
  }
}
