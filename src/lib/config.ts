import fs from 'node:fs'
import { z } from 'zod'
import { nanoid } from 'nanoid'

import type { DeepReadonly } from '../global.js'

function getNtfyUrl (cachePath: string) {
  const ntfyUrlCacheFile = `${cachePath}/ntfy-url`
  if (fs.existsSync(ntfyUrlCacheFile)) {
    return fs.readFileSync(ntfyUrlCacheFile).toString()
  }

  const ntfyUrl = `https://ntfy.sh/${nanoid()}`
  fs.mkdirSync(cachePath, { recursive: true })
  fs.writeFileSync(ntfyUrlCacheFile, ntfyUrl)

  console.log()
  console.log('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')
  console.log(`  📢 Publishing pending pair requests to Ntfy URL:\n\t${ntfyUrl}`)
  console.log('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')
  console.log()

  return ntfyUrl
}

const ConfigSchema = z.object({
  baseUrl: z.url(),
  server: z.object({
    port: z.number().int().positive(),
    listen: z.string(),
  }),
  cronExpression: z.string(),
  wolf: z.object({
    apiSocketPath: z.string(),
  }),
  handlers: z.object({
    ntfy: z.object({
      url: z.url(),
      username: z.string().optional(),
      password: z.string().optional(),
    }),
  }),
})

export type Config = DeepReadonly<z.infer<typeof ConfigSchema>>
export type ServerConfig = Config['server']

const serverPort = process.env.SERVER_PORT ?? '4000'
const serverHostname = process.env.SERVER_LISTEN ?? process.env.SERVER_HOSTNAME ?? '0.0.0.0'
const baseUrl = process.env.BASE_URL ?? `http://localhost:${serverPort}`
const cronExpression = process.env.CRON_EXPRESSION ?? '*/3 * * * * *' // Every 3 seconds
const wolfApiSocketPath = process.env.WOLF_API_SOCKET_PATH ?? '/var/run/wolf/wolf.sock'
const cachePath = process.env.CACHE_PATH ?? './cache'
const ntfyUrl = process.env.NTFY_URL ?? getNtfyUrl(cachePath)
const ntfyUsername = process.env.NTFY_USERNAME
const ntfyPassword = process.env.NTFY_PASSWORD

const toParse: Config = {
  baseUrl,
  server: {
    port: parseInt(serverPort),
    listen: serverHostname,
  },
  cronExpression,
  wolf: {
    apiSocketPath: wolfApiSocketPath,
  },
  handlers: {
    ntfy: {
      url: ntfyUrl,
      username: ntfyUsername,
      password: ntfyPassword,
    }
  }
}
const config = ConfigSchema.parse(toParse) as Config

export default config
