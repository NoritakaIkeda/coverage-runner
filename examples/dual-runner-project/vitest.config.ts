import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/vitest/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage-vitest',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts']
    }
  }
})