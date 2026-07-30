import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 'server-only' ships a client build that throws on import; under the
      // node test runner we don't need the guard, so stub it out.
      'server-only': resolve(__dirname, 'src/test/empty.ts'),
    },
  },
})
