import { field } from '@lolpants/jogger'
import {
  ApplicationCommandType,
  DMChannel,
  GuildMember,
  MessageContextMenuCommandInteraction as MessageContextMenuInteraction,
} from 'discord.js'
import { ContextMenu, Discord } from 'discordx'
import {
  channelField,
  ctxField,
  errorField,
  logger,
  userField,
} from '~/logger.js'

const context = ctxField('pin')

@Discord()
export abstract class Pin {
  @ContextMenu({ name: 'Pin / Unpin', type: ApplicationCommandType.Message })
  public async messageHandler(interaction: MessageContextMenuInteraction) {
    const channel = interaction.channel!
    if (channel instanceof DMChannel || channel.partial) {
      await interaction.reply({
        content: 'This cannot be run in DMs!',
        ephemeral: true,
      })

      return
    }

    const member = interaction.member!
    if (!(member instanceof GuildMember)) {
      await interaction.reply({
        content: 'Failed to resolve interaction member!',
        ephemeral: true,
      })

      return
    }

    const permissions = member.permissionsIn(channel)
    if (!permissions.has('ViewChannel') || !permissions.has('SendMessages')) {
      await interaction.reply({
        content: 'You do not have permission to manage pins in this channel!',
        ephemeral: true,
      })

      return
    }

    const message = await interaction.channel?.messages.fetch(
      interaction.targetMessage.id,
    )

    if (message === undefined) {
      await interaction.reply({
        content: 'Failed to find message!',
        ephemeral: true,
      })

      return
    }

    const isPinned = message.pinned
    try {
      const action = isPinned ? 'unpinned' : 'pinned'

      await (isPinned ? message.unpin() : message.pin())
      await interaction.reply({ content: `Message ${action}.` })

      logger.info(
        context,
        field('action', action),
        userField('user', interaction.user),
        channelField('channel', channel),
        field('message', message.id),
      )
    } catch (error: unknown) {
      const action = isPinned ? 'unpin' : 'pin'
      let message = `Failed to ${action} message!`

      if (error instanceof Error) {
        logger.error(context, errorField(error))
        message += `\n${error.message}`
      }

      await interaction.reply({
        content: message,
        ephemeral: true,
      })
    }
  }
}
