import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import type { Config } from './lib/config.js'

export default function createApp (config: Config): Hono {
  const app = new Hono()

  app.get('/pin/', async (c) => {
    const proxyRes = await proxy(`${config.wolf.httpBaseUrl}/pin/`, { ...c.req })
    proxyRes.headers.set('content-type', 'text/html; charset=utf-8')
    return proxyRes
  })

  app.post('/pin/', async (c) => {
    return proxy(`${config.wolf.httpBaseUrl}/pin/`, { ...c.req })
  })

  return app
}
