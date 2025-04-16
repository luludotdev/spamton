import type { CommandInteraction } from "discord.js";
import { time } from "discord.js";
import { Discord, Guild, Slash } from "discordx";
import { ClientType } from "ts3-nodejs-library";
import { env } from "~/env";
import { connect } from "~/ts3";

@Discord()
export abstract class TS {
  @Guild(env.GUILD_ID)
  @Slash({ name: "teamspeak", description: "Snoop on your friends" })
  public async runTeamspeak(ctx: CommandInteraction) {
    await ctx.deferReply({ flags: ["Ephemeral"] });

    await using ts = await connect();
    const clients = await ts.clientList({ clientType: ClientType.Regular });

    clients.sort((a, b) => {
      if (a.talkPower === b.talkPower) {
        return a.nickname.localeCompare(b.nickname);
      }

      return b.talkPower - a.talkPower;
    });

    const content = clients
      .map(({ nickname, away, lastconnected }): string => {
        const joined = time(new Date(lastconnected * 1_000), "R");
        let line = "* ";
        if (away) line += "(AFK) ";
        line += `**${nickname}** [joined ${joined}]`;

        return line;
      })
      .join("\n");

    await ctx.editReply({ content });
  }
}
