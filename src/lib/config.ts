import nodeConfig from 'config'
import { z } from 'zod'

import type { DeepReadonly } from '../global.js'

const ConfigSchema = z.object({
  baseUrl: z.url(),
  server: z.object({
    port: z.number().int().positive(),
    listen: z.string(),
  }),
  cronExpression: z.string(),
  wolf: z.object({
    apiSocketPath: z.string()
  }),
  handlers: z.object({
    ntfy: z.object({
      url: z.url(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
  })
})

export type Config = DeepReadonly<z.infer<typeof ConfigSchema>>
export type ServerConfig = Config['server']

const config = ConfigSchema.parse(nodeConfig.util.toObject()) as Config

export default config
