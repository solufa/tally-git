import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
      include: ['src/**'],
      exclude: ['src/index.ts'],
    },
  },
});
