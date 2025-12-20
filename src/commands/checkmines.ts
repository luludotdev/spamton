import type { CommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType as OptionType } from "discord.js";
import { Discord, Guild, Slash, SlashOption } from "discordx";
import { env } from "~/env";
import { Landmine } from "~/handlers/landmine";

const formatter = Intl.NumberFormat("en-GB", {
  style: "percent",
  minimumFractionDigits: 2,
});

@Discord()
export abstract class CheckMines {
  @Guild(env.GUILD_ID)
  @Slash({
    name: "checkmines",
    description: "Check minefield status for a user",
    defaultMemberPermissions: "ManageGuild",
  })
  public async checkMines(
    @SlashOption({
      name: "target",
      type: OptionType.User,
      description: "User to check",
      required: true,
    })
    target: GuildMember,
    ctx: CommandInteraction,
  ) {
    const landmine = Landmine.instance;
    const duds = landmine.duds(target.id);
    const chance = duds / Landmine.RNG_UPPER_BOUND;
    const avgMessages = landmine.simulate(duds);

    const content =
      `# Landmine stats for: ${target}\n` +
      `* Messages since last landmine: ${(duds - 1).toLocaleString("en-GB")}\n` +
      `* Chance to trigger: ${formatter.format(chance)}\n` +
      `* Average messages until trigger: ${avgMessages.toLocaleString("en-GB")}\n`;

    await ctx.reply({
      content,
      flags: ["Ephemeral"],
      allowedMentions: { parse: [] },
    });
  }
}
