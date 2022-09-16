import { Description } from '@discordx/utilities'
import { field } from '@lolpants/jogger'
import { type CommandInteraction, type MessageAttachment } from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { ctxField, errorField, logger, userField } from '~/logger.js'

const context = ctxField('avatar')

@Discord()
export abstract class Avatar {
  @Slash('avatar')
  @Description(`Set the bot's avatar`)
  // TODO: Default permissions
  public async setAvatar(
    @SlashOption('avatar', { type: 'ATTACHMENT' })
    avatar: MessageAttachment,
    ctx: CommandInteraction,
  ) {
    const { user } = ctx.client
    if (user === null) {
      await ctx.reply({
        content: 'Bot user is unset!',
        ephemeral: true,
      })

      return
    }

    try {
      await user.setAvatar(avatar.url)
      await ctx.reply({
        content: 'Avatar changed!',
        ephemeral: true,
      })

      logger.info(
        context,
        userField('invoker', ctx.user),
        field('url', avatar.url),
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(context, errorField(error))
      }

      await ctx.reply({
        content: 'Failed to set avatar!',
        ephemeral: true,
      })
    }
  }
}
