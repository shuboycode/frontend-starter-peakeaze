import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as unknown as PluginOption[],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-starter-nu.vercel.app',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/.eslintrc.cjs',
        '**/vite.config.ts'
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
