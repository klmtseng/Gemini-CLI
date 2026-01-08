import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for local development to match the required SDK usage
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});