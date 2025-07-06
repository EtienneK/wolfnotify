import { serve } from '@hono/node-server'

import cron from 'node-cron'

import { config } from './lib/config.js'
import createApp from './app.js'
import createCronJob from './cronjob.js'
import WolfApiClient from './lib/wolf/wolf-api-client.js'

const wolfApiClient = new WolfApiClient(config.wolf.apiSocketPath)
const app = createApp(config, wolfApiClient)

let cronTask: cron.ScheduledTask
const server = serve({
  fetch: app.fetch,
  port: config.server.port,
  hostname: config.server.listen
}, (info) => {
  console.log()
  console.log(`✅ Serving on ${info.family} ${info.address}:${info.port}`)
  console.log(`🌐 Web server base URL: ${config.baseUrl}`)
  console.log()

  cronTask = createCronJob(config, wolfApiClient)
})

async function cleanup () {
  if (cronTask) cronTask.destroy()
  server.close()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
