import Bun from 'bun'
import cron from 'node-cron'

import createApp from './app/app.js'
import createCronJob from './cronjob.js'
import config from './lib/config.js'
import WolfApiClient from './lib/wolf/wolf-api-client.js'

const wolfApiClient = new WolfApiClient(config.wolf.apiSocketPath)
const app = createApp(config, wolfApiClient)

const server = Bun.serve({
  port: config.server.port,
  hostname: config.server.listen,
  fetch: app.fetch,
})

console.log()
console.log(`✅ Serving on ${server.hostname}:${server.port}`)
console.log()

const cronTask: cron.ScheduledTask = createCronJob(config, wolfApiClient)

function cleanup () {
  console.log('Cleaning up...')
  if (cronTask) cronTask.destroy()
  server.stop()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('beforeExit', cleanup)
process.on('exit', cleanup)
