import { defineConfig } from 'vitest/config';

// Tests fonctionnels : la vraie base, lue dans api/.env en dev, dans l'environnement en CI
try {
  process.loadEnvFile();
} catch {
  // Pas de .env : on garde l'environnement tel quel
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Les fichiers partagent la même base : un à la fois
    fileParallelism: false,
  },
});
