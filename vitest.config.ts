import { defineConfig } from 'vitest/config';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/integration/**/*.integration.test.ts'],
    testTimeout: 30000, // 30 seconds for real API calls
    hookTimeout: 30000,
    env: loadEnv(mode, process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@/domain': path.resolve(__dirname, './src/domain'),
      '@/usecase': path.resolve(__dirname, './src/usecase'),
      '@/infrastructure': path.resolve(__dirname, './src/infrastructure'),
    },
  },
}));
