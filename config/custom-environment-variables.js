export default {
  baseUrl: 'BASE_URL',
  server: {
    port: 'SERVER_PORT',
    listen: 'SERVER_LISTEN'
  },
  cronExpression: 'CRON_EXPRESSION',
  wolf: {
    apiSocketDir: 'WOLF_API_SOCKET_DIR',
    apiSocketName: 'WOLF_API_SOCKET_NAME',
    httpBaseUrl: 'WOLF_HTTP_BASE_URL'
  },
  handlers: {
    ntfy: {
      url: 'NTFY_URL',
      username: 'NTFY_USERNAME',
      password: 'NTFY_PASSWORD'
    }
  },
  cachePath: 'CACHE_PATH'
}
