import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
      ],
      all: true,
      lines: 80,
      functions: 60,
      branches: 80,
      statements: 80
    },
  },
}) 