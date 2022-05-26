import { type CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

@Discord()
export abstract class Repo {
  @Slash('repo')
  public async runRepo(ctx: CommandInteraction) {
    await ctx.reply({ content: '<https://github.com/lolPants/spamton>' })
  }
}
