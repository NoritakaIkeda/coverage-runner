import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['examples/**/*', 'node_modules/**/*'],
    environment: 'node',
    globals: false,
  },
  esbuild: {
    target: 'node18',
  },
});
