const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
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