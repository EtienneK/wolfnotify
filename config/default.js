import fs from 'node:fs'
import { nanoid } from 'nanoid'
import { deferConfig } from 'config/defer.js'

export default {
  baseUrl: deferConfig(function () {
    return `http://localhost:${this.server.port}`
  }),
  server: {
    port: 4000,
    listen: '0.0.0.0'
  },
  cronExpression: '*/3 * * * * *', // Every 3 seconds
  wolf: {
    apiSocketPath: '/var/run/wolf/wolf.sock',
    httpBaseUrl: 'http://localhost:47989'
  },
  handlers: {
    ntfy: {
      url: deferConfig(function () {
        const ntfyUrlCacheFile = `${this.cachePath}/ntfy-url`
        if (fs.existsSync(ntfyUrlCacheFile)) {
          return fs.readFileSync(ntfyUrlCacheFile).toString()
        }

        const ntfyUrl = `https://ntfy.sh/${nanoid()}`
        fs.mkdirSync(this.cachePath, { recursive: true })
        fs.writeFileSync(ntfyUrlCacheFile, ntfyUrl)

        console.log()
        console.log('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')
        console.log(`  📢 Publishing pending pair requests to Ntfy URL:\n\t${ntfyUrl}`)
        console.log('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')
        console.log()

        return ntfyUrl
      })
    }
  },
  cachePath: './cache'
}
