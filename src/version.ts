import { execa } from 'execa'
import { GIT_VERSION } from '~/env.js'

export const getVersion = async () => {
  if (GIT_VERSION) return GIT_VERSION

  try {
    const { stdout: gitVersion } = await execa('git rev-parse --short HEAD')
    const { stdout: status } = await execa('git status -s')
    const dev = status !== ''

    return dev ? `${gitVersion} (dev)` : gitVersion
  } catch {
    return 'unknown'
  }
}
