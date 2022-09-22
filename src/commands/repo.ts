import { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export abstract class Repo {
  @Slash({ name: 'repo', description: 'You got repo' })
  public async runRepo(ctx: CommandInteraction) {
    await ctx.reply({ content: '<https://github.com/lolPants/spamton>' })
  }
}
