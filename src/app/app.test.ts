import { testClient } from 'hono/testing'
import { describe, it, expect } from 'bun:test'

import createApp from './app.js'
import config from '../lib/config.js'
import WolfApiClient from '../lib/wolf/wolf-api-client.js'

const app = createApp({
  ...config,
  ...{
    handlers: {
      ntfy: {
        url: 'https://ntfy.sh/Na6XOsF32LYXeyBSZgcTN'
      }
    }
  }
}, new WolfApiClient(config.wolf.apiSocketPath))

describe('Root endpoint', () => {
  const client = testClient(app)

  it('should display a welcome message', async () => {
    const res = await client.index.$get()
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('WolfNotify')
  })
})

describe('PIN endpoint', () => {
  const client = testClient(app)

  it('should display a PIN entry form', async () => {
    const res = await client.pin['secret_123456'].$get()
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<input type="hidden" name="secret" value="secret_123456"/>')
  })
})
