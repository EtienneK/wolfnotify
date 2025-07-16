import { html } from 'hono/html'
import { css, Style } from 'hono/css'

export interface BaseLayoutProps {
  title: string
  style?: Promise<string>
  lang?: string
  children?: any

  disableHtmx?: boolean
  disablePico?: boolean
}

const AppLayout = (props: BaseLayoutProps) => html`<!doctype html>
<html lang="${props.lang ?? 'en'}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>${props.title}</title>
    <link rel="icon" type="image/png" href="/static/img/favicon.png" />
    ${!props.disableHtmx && html`<script src="/static/js/htmx.min.js"></script>`}
    ${!props.disablePico && html`<link rel="stylesheet" href="/static/css/pico.min.css">`}
    ${<Style>{props.style ?? css``}</Style>}
  </head>
  <body>
    <main class='container main'>
      <article>
        ${props.children}
      </article>
    </main>
  </body>
</html>
`

export default AppLayout
