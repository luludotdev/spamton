import { join as joinPath } from 'node:path/posix'
import { dirname, importx } from '@discordx/importer'
import { exitHook } from '@lolpants/exit'
import { field } from '@lolpants/jogger'
import { IntentsBitField as Intents } from 'discord.js'
import { Client } from 'discordx'
import { env, IS_DEV } from '~/env.js'
import { ctxField, logger, userField } from '~/logger.js'
import { getVersion } from '~/version.js'

const client = new Client({
  silent: true,
  intents: [
    Intents.Flags.Guilds,
    Intents.Flags.GuildMessages,
    Intents.Flags.GuildMembers,
  ],
  botGuilds: [env.GUILD_ID],
})

client.once('ready', async () => {
  await client.guilds.fetch()
  await client.initApplicationCommands()

  const guild = await client.guilds.fetch(env.GUILD_ID)
  logger.info(
    field('action', 'ready'),
    userField('user', client.user!),
    field('guild', field('id', env.GUILD_ID), field('name', guild.name)),
  )
})

client.on('interactionCreate', interaction => {
  void client.executeInteraction(interaction)
})

export const run = async () => {
  const version = await getVersion()
  logger.info(
    ctxField('boot'),
    field('version', version),
    field('environment', IS_DEV ? 'dev' : 'prod'),
  )

  const imports = joinPath(
    dirname(import.meta.url).replaceAll('\\', '/'),
    '/{handlers,commands}/**/*.{ts,js}',
  )

  await importx(imports)
  await client.login(env.TOKEN)
}

exitHook(async exit => {
  client.destroy()
  exit()
})
