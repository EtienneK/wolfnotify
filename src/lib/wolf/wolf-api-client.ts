import fs from 'node:fs'
import { fetch, Agent, Response, type RequestInit } from 'undici'
import type { paths } from './wolf-api-schema.js'

export default class WolfApiClient {
  private readonly fetch: (path: keyof paths, init?: RequestInit) => Promise<Response>

  constructor (public readonly socketPath: string) {
    this.fetch = (path, init) => fetch(`http://localhost${path}`, {
      dispatcher: new Agent({
        connect: {
          socketPath: this.socketPath
        }
      }),
      ...init
    })
  }

  socketExists () {
    return fs.existsSync(this.socketPath)
  }

  getPendingPairRequests () {
    return this.fetch('/api/v1/pair/pending')
      .then(res => res.json()) as Promise<paths['/api/v1/pair/pending']['get']['responses']['200']['content']['application/json']>
  }

  pairClient (pairRequest: paths['/api/v1/pair/client']['post']['requestBody']['content']['application/json']) {
    return this.fetch('/api/v1/pair/client', {
      method: 'POST',
      body: JSON.stringify(pairRequest),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()) as Promise<
      paths['/api/v1/pair/client']['post']['responses']['200']['content']['application/json']
      | paths['/api/v1/pair/client']['post']['responses']['500']['content']['application/json']
      >
  }
}
