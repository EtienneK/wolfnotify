import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'

import { fetch, Agent } from 'undici'
import cron from 'node-cron'

import { config as config0 } from './lib/config.js'

interface PendingPairRequests {
  success: boolean
  requests: Array<PendingPairRequest>
}

interface PendingPairRequest {
  pair_secret: string
  client_ip: string
}

let startup = true
let pairSecretCache: Array<string> = []

const config = {
  _ntfyUrlSet: !!process.env.NTFY_URL,
}

async function cronjob () {
  const resp = await fetch('http://localhost/api/v1/pair/pending', {
    dispatcher: new Agent({
      connect: {
        socketPath: config0.wolf.apiSocketPath
      }
    })
  })

  const pendingPairRequests = await resp.json() as PendingPairRequests
  if (pendingPairRequests.success) {
    for (const pendingPairRequest of pendingPairRequests.requests) {
      const pairSecret = pendingPairRequest.pair_secret
      if (!pairSecretCache.includes(pairSecret)) {
        pairSecretCache.push(pairSecret)
        if (!startup) { // Don't send any notifications of pair requests created pre-startup
          console.log(Date.now(), ' - Sending ntfy for pair secret:', pairSecret)
          await fetch('https://ntfy.sh/NRM5akZSjEdkhqo5', { // TODO - actual address!!!
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

serve({
  fetch: app.fetch,
  port: config0.server.port,
  hostname: config0.server.listen
}, (info) => {
  console.log()
  console.log(`✅ Serving on ${info.family} ${info.address}:${info.port}`)
  console.log(`🌐 Web server base URL: ${config0.baseUrl}`)
  console.log()

  cron.schedule(config0.cronExpression, cronjob) // TODO: gracefully shut down cron job
  if (!config._ntfyUrlSet) {
    console.log('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')
    console.log(`  📢 Publishing pending pair requests to Ntfy URL:\n\t${config0.handlers.ntfy.url}`)
    console.log('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')
    console.log()
  }
})
