import { defineConfig } from 'vitest/config';

// Tests unitaires du front : la logique des écrans, sans navigateur
export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
