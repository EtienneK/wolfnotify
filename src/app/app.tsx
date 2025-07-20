import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

import type { Config } from '../lib/config.js'
import AppLayout from './AppLayout.js'
import { css } from 'hono/css'
import type WolfApiClient from '../lib/wolf/wolf-api-client.js'

const style = css`
.main {
  max-width: 320px;
  margin: 0 auto;
  text-align: center;
}

.pin-input {
  text-align: center;
  font-size: 2em;
}
`

function createApp (config: Config, wolfApiClient: WolfApiClient) {
  return new Hono()

    .use('/static/css/pico.min.css', serveStatic({ path: './node_modules/@picocss/pico/css/pico.violet.min.css' }))
    .use('/static/js/htmx.min.js', serveStatic({ path: './node_modules/htmx.org/dist/htmx.min.js' }))
    .use('/static/*', serveStatic({ root: './' }))

    .get('/', (c) => {
      return c.html(
        <AppLayout title='WolfNotify' disableHtmx style={style}>
          <h1>🐺</h1>
          <h2>WolfNotify</h2>
        </AppLayout>
      )
    })

    .get('/pin/:secret', async (c) => {
      return c.html(
        <AppLayout title='WolfNotify' style={style}>
          <form
            hx-post={`/pin/${c.req.param('secret')}`}
            hx-target='this'
            hx-swap='innerHTML'
          >
            <h1>🐺</h1>
            <h2>Enter PIN:</h2>
            <input
              className='pin-input'
              type='tel'
              name='pin'
              placeholder='####'
              pattern='[0-9]{4}'
              maxlength={4}
              required
              autofocus
            />
            <button type='submit'>Submit</button>
            <input type='hidden' name='secret' value={c.req.param('secret')} />
          </form>
        </AppLayout>
      )
    })

    .post('/pin/:secret', async (c) => {
      const body = await c.req.formData()

      const res = await wolfApiClient.pairClient({
        pair_secret: body.get('secret') as string,
        pin: body.get('pin') as string
      })

      if (!res.success) {
        return c.html(<h1>❌ {res.error}</h1>)
      }

      return c.html(<h1>✅ OK</h1>)
    })
}

export default createApp
