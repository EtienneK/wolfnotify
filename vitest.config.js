import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      BASE_URL: process.env['BASE_URL'] ?? undefined, // Bug: https://github.com/vitest-dev/vitest/discussions/5695
    },
  },
})
