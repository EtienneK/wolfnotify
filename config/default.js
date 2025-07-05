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
        return `https://ntfy.sh/${nanoid()}`
      })
    }
  }
}
