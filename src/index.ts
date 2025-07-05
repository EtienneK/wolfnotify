import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'

import { fetch } from 'undici'
import cron from 'node-cron'

import { config as config0 } from './lib/config.js'
import WolfApiClient from './lib/wolf/wolf-api-client.js'

let startup = true
let pairSecretCache: Array<string> = []

const wolfApiClient = new WolfApiClient(config0.wolf.apiSocketPath)

async function cronjob () {
  const pendingPairRequests = await wolfApiClient.getPendingPairRequests()
  if (pendingPairRequests.success) {
    for (const pendingPairRequest of pendingPairRequests.requests) {
      const pairSecret = pendingPairRequest.pair_secret
      if (!pairSecretCache.includes(pairSecret)) {
        pairSecretCache.push(pairSecret)
        if (!startup) { // Don't send any notifications of pair requests created pre-startup
          console.log(Date.now(), ' - Sending ntfy for pair secret:', pairSecret)
          await fetch(config0.handlers.ntfy.url, {
            method: 'POST', // PUT works too
            body: '🐺 Wolf pairing request',
            headers: { Click: `${config0.baseUrl}/pin/#${pairSecret}` }
          })
        }
      }
    }
    pairSecretCache = pairSecretCache.filter(ps => pendingPairRequests.requests.map(ppr => ppr.pair_secret).includes(ps))
    startup = false
  } else {
    console.error('Unable to fetch pending pair requests from Wolf API socket')
  }
}

const app = new Hono()

app.get('/pin/', async (c) => {
  const proxyRes = await proxy(`${config0.wolf.httpBaseUrl}/pin/`, { ...c.req })
  proxyRes.headers.set('content-type', 'text/html; charset=utf-8')
  return proxyRes
})

app.post('/pin/', async (c) => {
  return proxy(`${config0.wolf.httpBaseUrl}/pin/`, { ...c.req })
})

let cronTask: cron.ScheduledTask
const server = serve({
  fetch: app.fetch,
  port: config0.server.port,
  hostname: config0.server.listen
}, (info) => {
  console.log()
  console.log(`✅ Serving on ${info.family} ${info.address}:${info.port}`)
  console.log(`🌐 Web server base URL: ${config0.baseUrl}`)
  console.log()

  cronTask = cron.schedule(config0.cronExpression, cronjob)
})

async function cleanup () {
  if (cronTask) cronTask.destroy()
  server.close()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
