import { type MessageContextMenuInteraction } from 'discord.js'
import { ContextMenu, Discord } from 'discordx'

@Discord()
export abstract class Pin {
  @ContextMenu('MESSAGE', 'Pin / Unpin')
  public async messageHandler(interaction: MessageContextMenuInteraction) {
    const message = await interaction.channel?.messages.fetch(
      interaction.targetMessage.id
    )

    if (message === undefined) {
      await interaction.reply({
        content: 'Failed to find message!',
        ephemeral: true,
      })

      return
    }

    try {
      const action = message.pinned ? 'Unpinned' : 'Pinned'
      await (message.pinned ? message.unpin() : message.pin())

      await interaction.reply({
        content: `${action} message.`,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
      }

      const action = message.pinned ? 'unpin' : 'pin'
      await interaction.reply({
        content: `Failed to ${action} message!\nCheck permissions and pin limit.`,
        ephemeral: true,
      })
    }
  }
}
