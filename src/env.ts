import '@lolpants/env/register'
import { registerString } from '@lolpants/env'

// #region Globals
const NODE_ENV = registerString('NODE_ENV')
const IS_PROD = NODE_ENV?.toLowerCase() === 'production'
export const IS_DEV = !IS_PROD
// #endregion
