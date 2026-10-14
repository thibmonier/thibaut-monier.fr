import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/content/schemas/**/*.ts', 'scripts/checks/lib/**/*.ts'],
      reporter: ['text-summary', 'html'],
      thresholds: { lines: 80, branches: 75, functions: 80, statements: 80 },
    },
  },
});
