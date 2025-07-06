import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Config } from './lib/config.js'
import { html } from 'hono/html'
import { css, Style } from 'hono/css'
import type WolfApiClient from './lib/wolf/wolf-api-client.js'

interface SiteData {
  title: string
  children?: any
}

const Layout = (props: SiteData) => html`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="/static/css/pico.min.css">
    <title>${props.title}</title>
    <script src="/static/js/htmx.min.js"></script>
    ${<Style>{css`
      .main {
        max-width: 320px;
        margin: 0 auto;
        text-align: center;
      }

      .pin-input {
        text-align: center;
        font-size: 2em;
      }
    `}</Style>}
  </head>
  <body>
    <main class="container main">
      <article>
        ${props.children}
      </article>
    </main>
  </body>
</html>
`

const PinEntry = (props: { secret: string }) => (
  <>
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
    <hidden name='secret' value={props.secret} />
  </>
)

export default function createApp (config: Config, wolfApiClient: WolfApiClient): Hono {
  const app = new Hono()

  app.use('/static/css/pico.min.css', serveStatic({ path: './node_modules/@picocss/pico/css/pico.violet.css' }))
  app.use('/static/js/htmx.min.js', serveStatic({ path: './node_modules/htmx.org/dist/htmx.min.js' }))

  app.get('/', (c) => {
    return c.html(
      <Layout title='WolfNotify'>
        <h1>🐺</h1>
        <h2>WolfNotify</h2>
      </Layout>
    )
  })

  app.get('/pin/:secret', async (c) => {
    return c.html(
      <Layout title='WolfNotify'>
        <form
          hx-post={`/pin/${c.req.param('secret')}`}
          hx-target='this'
          hx-swap='innerHTML'
        >
          <PinEntry secret={c.req.param('secret')} />
        </form>
      </Layout>
    )
  })

  app.post('/pin/:secret', async (c) => {
    const body = await c.req.formData()

    const res = await wolfApiClient.pairClient({
      pair_secret: c.req.param('secret'),
      pin: body.get('pin') as string
    })

    if (!res.success) {
      return c.html(<h1>❌ {res.error}</h1>)
    }

    return c.html(<h1>OK</h1>)
  })

  return app
}
