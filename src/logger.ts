import {
  createConsoleSink,
  createField,
  createFileSink,
  createLogger,
  field,
  type Field,
} from '@lolpants/jogger'
import type { ForumChannel } from 'discord.js'
import {
  ChannelType,
  type GuildMember,
  type Role,
  type TextBasedChannel,
  User,
  type VoiceBasedChannel,
} from 'discord.js'
import { env, IS_DEV } from '~/env.js'

const consoleSink = createConsoleSink({
  debug: IS_DEV,
})

const fileSink = createFileSink({
  name: 'bot',
  directory: 'logs',
  debug: env.DEBUG_LOGS ?? IS_DEV,
  rollEveryDay: true,
})

export const logger = createLogger({
  name: 'bot',
  sink: [consoleSink, fileSink],
})

export const ctxField = createField('context')
export const errorField: <T extends Error>(error: T) => Field = error => {
  const fields: [Field, ...Field[]] = [
    field('type', error.name),
    field('message', error.message),
  ]

  if (error.stack) fields.push(field('stack', error.stack))
  return field('error', ...fields)
}

export const userField: (name: string, user: GuildMember | User) => Field = (
  name,
  userLike,
) => {
  const user = userLike instanceof User ? userLike : userLike.user
  return field(name, field('id', user.id), field('tag', user.tag))
}

export const channelField: (
  name: string,
  channel: ForumChannel | TextBasedChannel | VoiceBasedChannel,
) => Field = (name, channel) => {
  const channelType = ChannelType[channel.type] ?? 'unknown'
  const fields: [Field, ...Field[]] = [
    field('id', channel.id),
    field('type', channelType),
  ]

  if (channel.isDMBased()) {
    return field(name, ...fields, userField('recipient', channel.recipient!))
  }

  if (channel.isVoiceBased()) {
    return field(name, ...fields, field('name', channel.name))
  }

  if (channel.isThread()) {
    return field(
      name,
      ...fields,
      field('name', `#${channel.name}`),
      channelField('parent', channel.parent!),
    )
  }

  return field(name, ...fields, field('name', `#${channel.name}`))
}

export const roleField: (name: string, role: Role) => Field = (name, role) => {
  return field(name, field('id', role.id), field('name', role.name))
}

export const flush = async () => fileSink.flush()
