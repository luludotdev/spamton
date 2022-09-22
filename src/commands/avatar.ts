import { field } from '@lolpants/jogger'
import {
  CommandInteraction,
  ApplicationCommandOptionType as OptionType,
  Attachment,
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { ctxField, errorField, logger, userField } from '~/logger.js'

const context = ctxField('avatar')

@Discord()
export abstract class Avatar {
  @Slash({
    name: 'avatar',
    description: `Set the bot's avatar`,
    defaultMemberPermissions: 'ManageGuild',
  })
  public async setAvatar(
    @SlashOption({
      name: 'avatar',
      type: OptionType.Attachment,
      description: 'Avatar',
      required: true,
    })
    avatar: Attachment,
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
