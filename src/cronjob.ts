import cron from 'node-cron'
import WolfApiClient from './lib/wolf/wolf-api-client.js'
import type { Config } from './lib/config.js'

export default function createCronJob (config: Config, wolfApiClient: WolfApiClient): cron.ScheduledTask {
  let startup = true
  let pairSecretCache: Array<string> = []

  async function cronjob () {
    if (!wolfApiClient.socketExists()) {
      console.error(`Wolf socket '${wolfApiClient.socketPath}' not found. Is the Wolf container still starting up? Have you mounted the Wolf API socket?`)
      return
    }

    const pendingPairRequests = await wolfApiClient.getPendingPairRequests()
    if (pendingPairRequests.success) {
      for (const pendingPairRequest of pendingPairRequests.requests) {
        const pairSecret = pendingPairRequest.pair_secret
        if (!pairSecretCache.includes(pairSecret)) {
          pairSecretCache.push(pairSecret)
          if (!startup) { // Don't send any notifications of pair requests created pre-startup
            console.log(Date.now(), ' - Sending ntfy for pair secret:', pairSecret)
            const pinUrl = `${config.baseUrl}/pin/${pairSecret}`

            const headers: HeadersInit = {
              Title: 'Wolf - pending pairing request',
              Tags: 'wolf',
              Click: pinUrl,
              Actions: `view, Open PIN Entry, ${pinUrl}, clear=true`
            }

            const { username, password } = config.handlers.ntfy
            if (username && password) {
              headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
            }

            await fetch(config.handlers.ntfy.url, {
              method: 'POST', // PUT works too
              body: 'Enter PIN to finish pairing your client',
              headers,
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

  return cron.schedule(config.cronExpression, async () => {
    try {
      await cronjob()
    } catch (error) {
      console.error('Error in cron job:', error)
    }
  })
}
