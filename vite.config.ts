import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      thresholds: { statements: 99, branches: 97, functions: 100, lines: 99 },
      include: ['src/**'],
      exclude: ['src/index.ts', 'src/utils/condition.ts'],
    },
  },
});
