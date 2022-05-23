import 'source-map-support/register.js'
import 'reflect-metadata'

import { dirname, importx } from '@discordx/importer'
import { exitHook } from '@lolpants/exit'
import { field } from '@lolpants/jogger'
import { Intents } from 'discord.js'
import { Client } from 'discordx'
import { join as joinPath } from 'node:path/posix'
import { GUILD_ID, TOKEN } from '~/env.js'
import { errorField, flush, logger, userField } from '~/logger.js'

const client = new Client({
  silent: true,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  botGuilds: [GUILD_ID],
})

client.once('ready', async () => {
  await client.guilds.fetch()
  await client.initApplicationCommands()

  logger.info(field('action', 'ready'), userField('user', client.user!))
})

client.on('interactionCreate', interaction => {
  void client.executeInteraction(interaction)
})

const run = async () => {
  const imports = joinPath(
    dirname(import.meta.url).replaceAll('\\', '/'),
    '/{handlers,commands}/**/*.{ts,js}'
  )

  await importx(imports)
  await client.login(TOKEN)
}

exitHook(async (exit, error) => {
  client.destroy()

  if (error) {
    logger.error(errorField(error))
  } else {
    logger.info(field('action', 'shutdown'))
  }

  await flush()
  exit()
})

void run()
