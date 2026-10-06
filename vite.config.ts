import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://leo-chat-backend.onrender.com',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://leo-chat-backend.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
