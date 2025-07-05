import nodeConfig from 'config'
import { z } from 'zod'
import type { DeepReadonly } from '../types/types.js'

const ConfigSchema = z.object({
  baseUrl: z.string().url(),
  server: z.object({
    port: z.number().int().positive(),
    listen: z.string(),
  }),
  cronExpression: z.string(),
  wolf: z.object({
    apiSocketPath: z.string(),
    httpBaseUrl: z.string().url()
  }),
  handlers: z.object({
    ntfy: z.object({
      url: z.string().url()
    })
  })
})

export type Config = DeepReadonly<z.infer<typeof ConfigSchema>>

export const config = ConfigSchema.parse(nodeConfig.util.toObject()) as Config
